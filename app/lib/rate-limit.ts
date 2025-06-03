import { Ratelimit } from "@upstash/ratelimit"
import { NextResponse } from "next/server"
import { redis } from "./redis"

// Define rate limit configurations for different endpoints
const rateLimitConfigs = {
  sources: {
    anonymous: {
      limit: 10,
      window: "1 d",
      prefix: "ratelimit:sources:anonymous",
    },
    authenticated: {
      limit: 30,
      window: "1 d",
      prefix: "ratelimit:sources:authenticated",
    },
  },
  // Add more endpoints as needed, for example:
  // chat: {
  //   anonymous: {
  //     limit: 20,
  //     window: "1 d",
  //     prefix: "ratelimit:chat:anonymous",
  //   },
  //   authenticated: {
  //     limit: 100,
  //     window: "1 d",
  //     prefix: "ratelimit:chat:authenticated",
  //   },
  // },
} as const

// Create rate limiters for each endpoint
const rateLimiters = Object.entries(rateLimitConfigs).reduce(
  (acc, [endpoint, config]) => ({
    ...acc,
    [endpoint]: {
      anonymous: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.anonymous.limit, config.anonymous.window),
        analytics: true,
        prefix: config.anonymous.prefix,
      }),
      authenticated: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(config.authenticated.limit, config.authenticated.window),
        analytics: true,
        prefix: config.authenticated.prefix,
      }),
    },
  }),
  {} as Record<string, { anonymous: Ratelimit; authenticated: Ratelimit }>
)

export async function checkRateLimit(
  endpoint: keyof typeof rateLimitConfigs,
  userId: string,
  isAuthenticated: boolean
) {
  const limiter = isAuthenticated
    ? rateLimiters[endpoint].authenticated
    : rateLimiters[endpoint].anonymous

  const { success, limit, reset, remaining } = await limiter.limit(userId)

  return {
    success,
    limit,
    reset,
    remaining,
    isAuthenticated,
  }
}

export function createRateLimitResponse(rateLimitInfo: {
  success: boolean
  limit: number
  reset: number
  remaining: number
  isAuthenticated: boolean
}) {
  const headers = {
    "X-RateLimit-Limit": rateLimitInfo.limit.toString(),
    "X-RateLimit-Remaining": rateLimitInfo.remaining.toString(),
    "X-RateLimit-Reset": rateLimitInfo.reset.toString(),
  }

  if (!rateLimitInfo.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        message: `You have exceeded your daily limit of ${rateLimitInfo.limit} requests. Please try again later.`,
        reset: rateLimitInfo.reset,
      },
      {
        status: 429,
        headers,
      }
    )
  }

  // Check if we're transitioning to smaller model
  const isTransitioningToSmallerModel = shouldUseSmallerModel(rateLimitInfo)
  const transitionMessage = isTransitioningToSmallerModel
    ? `You have ${rateLimitInfo.remaining} requests remaining today. Using a faster model to conserve your remaining requests.`
    : null

  return { 
    headers,
    transitionMessage,
    isTransitioningToSmallerModel
  }
}

// Helper to determine if we should use a smaller model
export function shouldUseSmallerModel(rateLimitInfo: {
  success: boolean
  remaining: number
  isAuthenticated: boolean
}) {
  // For authenticated users, use smaller model when less than 10 requests remaining
  if (rateLimitInfo.isAuthenticated && rateLimitInfo.remaining <= 10) {
    return true
  }
  
  // For anonymous users, use smaller model for last 5 requests
  if (!rateLimitInfo.isAuthenticated && rateLimitInfo.remaining <= 5) {
    return true
  }

  return false
} 
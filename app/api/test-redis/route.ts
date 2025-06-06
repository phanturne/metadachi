import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    // Test Redis connection
    await redis.set('test', 'Hello from Redis!');
    const value = await redis.get('test');

    return NextResponse.json({
      success: true,
      message: 'Redis connection successful',
      testValue: value,
    });
  } catch (error) {
    console.error('Redis connection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to connect to Redis',
      },
      { status: 500 }
    );
  }
}

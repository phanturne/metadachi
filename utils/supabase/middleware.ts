import { AUTH_ROUTES, PROTECTED_ROUTES, ROUTES } from '@/lib/constants';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      // biome-ignore lint: Forbidden non-null assertion.
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      // biome-ignore lint: Forbidden non-null assertion.
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    const isProtectedRoute = PROTECTED_ROUTES.some(page =>
      request.nextUrl.pathname.startsWith(page)
    );

    if (user.error && isProtectedRoute) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }

    // Special handling for bind account route - only allow anonymous users
    if (request.nextUrl.pathname.startsWith(ROUTES.BIND_ACCOUNT)) {
      if (user.data.user && user.data.user.email) {
        // User is not anonymous (has email), redirect to home
        return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
      }
      return response;
    }

    // Special handling for reset password route
    if (request.nextUrl.pathname.startsWith(ROUTES.RESET_PASSWORD)) {
      const token_hash = request.nextUrl.searchParams.get('token_hash');
      if (!token_hash) {
        return NextResponse.redirect(new URL(ROUTES.FORGOT_PASSWORD, request.url));
      }
      return response;
    }

    // If the user is logged in and trying to access auth pages (except reset password and bind account)
    const isAuthPage = AUTH_ROUTES.filter(
      route => route !== ROUTES.RESET_PASSWORD && route !== ROUTES.BIND_ACCOUNT
    ).some(page => request.nextUrl.pathname.startsWith(page));

    if (user.data.user && isAuthPage) {
      return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    }

    return response;
  } catch {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};

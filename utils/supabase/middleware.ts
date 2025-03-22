import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { AUTH_ROUTES, PROTECTED_ROUTES, ROUTES } from '@/utils/constants';

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
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    const isProtectedRoute = PROTECTED_ROUTES.some((page) =>
      request.nextUrl.pathname.startsWith(page),
    );

    if (user.error && isProtectedRoute) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url));
    }

    // If the user is logged in,
    const isAuthPage = AUTH_ROUTES.some((page) =>
      request.nextUrl.pathname.startsWith(page),
    );

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

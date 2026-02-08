/**
 * API authentication utilities for App Router Route Handlers
 */

import { createServerClient } from "@supabase/ssr";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type AuthSuccess = {
  supabase: SupabaseClient;
  user: User;
};

type AuthError = {
  error: string;
  status: 401;
};

/**
 * Authenticate request using Next.js cookies
 * For use in App Router Route Handlers
 */
export async function authenticateRequest(
  request: Request
): Promise<AuthSuccess | AuthError> {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      error: authError?.message ?? "Not authenticated",
      status: 401,
    };
  }

  return {
    supabase,
    user,
  };
}

/**
 * Create an unauthenticated Supabase client for public endpoints
 * For use in App Router Route Handlers
 */
export async function createUnauthenticatedClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

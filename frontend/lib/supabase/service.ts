/**
 * Server-side Supabase client with service role key
 * BYPASSES Row Level Security (RLS) - use ONLY in API routes/server components
 *
 * DO NOT import this in client components!
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Check if we're on the server
const isServer = typeof window === "undefined";

/**
 * Create a Supabase client with service role key
 * This bypasses Row Level Security (RLS) policies
 *
 * WARNING: Only use this in trusted server-side code (API routes, server components)
 * NEVER expose this client to the browser
 */
export function createServiceClient(): SupabaseClient {
  if (!isServer) {
    throw new Error(
      "createServiceClient() can only be called on the server-side. " +
      "Client components should use HTTP clients to call API routes instead."
    );
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
  }

  if (!process.env.SUPABASE_SECRET_KEY) {
    throw new Error("Missing SUPABASE_SECRET_KEY environment variable");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!, // Service role key bypasses RLS
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Lazy singleton - only creates client when accessed on server
let _serviceClient: SupabaseClient | null = null;

export const serviceClient = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    if (!isServer) {
      throw new Error(
        `Attempted to access Supabase service client on client-side (property: ${String(prop)}). ` +
        `Repositories should only be used in API routes, not in client components.`
      );
    }

    // Lazy init on first access (server-side only)
    if (!_serviceClient) {
      _serviceClient = createServiceClient();
    }

    return (_serviceClient as any)[prop];
  },
});

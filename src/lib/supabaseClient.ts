import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if environment variables are not set
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase environment variables not set. Using mock client.");
    // Return a mock client that prevents errors
    return {
      auth: {
        signInWithPassword: () =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured" },
          }),
        signOut: () => Promise.resolve({ error: null }),
        getSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({
          data: { subscription: { unsubscribe: () => {} } },
        }),
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured" },
          }),
        update: () =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured" },
          }),
        delete: () =>
          Promise.resolve({
            data: null,
            error: { message: "Supabase not configured" },
          }),
      }),
    } as any;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();

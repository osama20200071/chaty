import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession, useUser } from "@clerk/clerk-expo";

export const useSupabase = () => {
  // The `useUser()` hook will be used to ensure that Clerk has loaded data about the logged in user
  const { user } = useUser();
  // The `useSession()` hook will be used to get the Clerk session object
  const { session } = useSession();

  // Create a `client` object for accessing Supabase data using the Clerk token
  const client = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_KEY,
    {
      global: {
        // Get the custom Supabase token from Clerk
        fetch: async (url, options = {}) => {
          const clerkToken = await session?.getToken({
            template: "supabase",
          });

          // Insert the Clerk Supabase token into the headers
          const headers = new Headers(options?.headers);
          headers.set("Authorization", `Bearer ${clerkToken}`);

          // Now call the default fetch
          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );

  return client;
};

export const tokenProvider = async (supabase: SupabaseClient) => {
  const { data } = await supabase.functions.invoke("stream-chat-token");
  return data.token;
};

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { StreamChat } from "npm:stream-chat";

console.log("Hello from stream-chat-token Functions!");

serve(async (req) => {
  try {
    // Supabase Auth JWT verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify the Supabase JWT token (Optional)
    const SUPABASE_JWT_SECRET = Deno.env.get("JWT_SECRET");
    if (!SUPABASE_JWT_SECRET) {
      throw new Error("SUPABASE_JWT_SECRET is missing");
    }

    // Decode the JWT token (Deno standard library does not have a built-in way)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const userId = payload.userId;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 403,
      });
    }

    // Generate Stream Chat token
    const STREAM_API_KEY = Deno.env.get("STREAM_API_KEY");
    const STREAM_API_SECRET = Deno.env.get("STREAM_API_SECRET");

    if (!STREAM_API_KEY || !STREAM_API_SECRET) {
      throw new Error("Stream credentials are missing");
    }

    const serverClient = StreamChat.getInstance(
      STREAM_API_KEY,
      STREAM_API_SECRET
    );
    const streamToken = serverClient.createToken(userId);

    return new Response(JSON.stringify({ token: streamToken }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating token:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stream-chat-token' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, OptionsMiddleware } from "../_shared/cors.ts";

const movedResponse = () =>
  new Response(
    JSON.stringify({
      message: "Password management moved to Prymeira Account.",
    }),
    {
      status: 410,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    },
  );

Deno.serve(async (req: Request) =>
  OptionsMiddleware(req, async (req) => {
    if (req.method === "PATCH" || req.method === "POST") {
      return movedResponse();
    }

    return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }),
);

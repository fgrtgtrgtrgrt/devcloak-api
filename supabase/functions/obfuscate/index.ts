import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LUAOBFUSCATOR_API = "https://api.luaobfuscator.com/v1/obfuscator";

type ObfuscateRequestBody = {
  code?: string;
  config?: Record<string, unknown>;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") ?? "",
        },
      },
    });

    // Require auth (keeps this endpoint from becoming a public obfuscation proxy)
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json().catch(() => ({}))) as ObfuscateRequestBody;
    const code = (body.code ?? "").toString();

    if (!code.trim()) {
      return new Response(JSON.stringify({ error: "Missing code" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LUAOBFUSCATOR_API_KEY") || "test";

    // 1) newscript
    const sessionRes = await fetch(`${LUAOBFUSCATOR_API}/newscript`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        "content-type": "text",
      },
      body: code,
    });

    const sessionText = await sessionRes.text();
    if (!sessionRes.ok) {
      console.error("[obfuscate] newscript failed", sessionRes.status, sessionText);
      return new Response(JSON.stringify({ error: "Failed to create session" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sessionJson = JSON.parse(sessionText);
    if (sessionJson?.message) {
      console.error("[obfuscate] newscript error message", sessionJson.message);
      return new Response(JSON.stringify({ error: sessionJson.message }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sessionId = sessionJson?.sessionId as string | undefined;
    if (!sessionId) {
      console.error("[obfuscate] newscript missing sessionId", sessionJson);
      return new Response(JSON.stringify({ error: "No sessionId returned" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) obfuscate - Use SAFE Roblox-compatible settings
    // CRITICAL: Avoid aggressive transforms that break Roblox's Luau runtime
    const defaultConfig = {
      MinifiyAll: true,
      CustomPlugins: {
        // Variable/function renaming only - safest option
        Minifier: true
      }
    };
    const config = body.config ?? defaultConfig;
    const obfRes = await fetch(`${LUAOBFUSCATOR_API}/obfuscate`, {
      method: "POST",
      headers: {
        apikey: apiKey,
        sessionId,
        "content-type": "application/json",
      },
      body: JSON.stringify(config),
    });

    const obfText = await obfRes.text();
    if (!obfRes.ok) {
      console.error("[obfuscate] obfuscate failed", obfRes.status, obfText);
      return new Response(JSON.stringify({ error: "Failed to obfuscate" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const obfJson = JSON.parse(obfText);
    if (obfJson?.message) {
      console.error("[obfuscate] obfuscate error message", obfJson.message);
      return new Response(JSON.stringify({ error: obfJson.message }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const obfuscatedCode = obfJson?.code as string | undefined;
    if (!obfuscatedCode) {
      console.error("[obfuscate] obfuscate missing code", obfJson);
      return new Response(JSON.stringify({ error: "No code returned" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ code: obfuscatedCode }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[obfuscate] Unexpected error", e);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

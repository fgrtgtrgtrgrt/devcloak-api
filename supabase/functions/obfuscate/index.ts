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

// Local fallback obfuscation when API fails
function localObfuscate(code: string): string {
  const generateVarName = (): string => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let name = "_" + chars[Math.floor(Math.random() * 52)];
    for (let i = 0; i < 6; i++) {
      name += chars[Math.floor(Math.random() * chars.length)];
    }
    return name;
  };

  const reserved = new Set([
    'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
    'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true',
    'until', 'while', 'game', 'workspace', 'script', 'wait', 'spawn', 'task',
    'pcall', 'print', 'warn', 'error', 'pairs', 'ipairs', 'tostring', 'tonumber',
    'type', 'typeof', 'setmetatable', 'getmetatable', 'rawget', 'rawset',
    'string', 'table', 'math', 'bit32', 'coroutine', 'Instance', 'Vector3',
    'Vector2', 'CFrame', 'Color3', 'Enum', '_G', 'shared', 'loadstring',
    'getfenv', 'setfenv', 'require', 'select', 'unpack', 'next'
  ]);

  let obfuscated = code;
  const varMap = new Map<string, string>();

  // Find and rename local variables
  const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
  let match;
  while ((match = localPattern.exec(code)) !== null) {
    const varName = match[1];
    if (!reserved.has(varName) && !varMap.has(varName)) {
      varMap.set(varName, generateVarName());
    }
  }

  for (const [original, renamed] of varMap) {
    const regex = new RegExp(`\\b${original}\\b`, 'g');
    obfuscated = obfuscated.replace(regex, renamed);
  }

  // Wrap in pcall for safety
  const wrapperVar = generateVarName();
  const errVar = generateVarName();

  return `-- VizionDevelopments Protected
local ${wrapperVar}, ${errVar} = pcall(function()
${obfuscated}
end)
if not ${wrapperVar} then
  warn("[VizionDevelopments] Error: " .. tostring(${errVar}))
end`;
}

// Try API obfuscation with retry logic
async function tryObfuscateWithAPI(code: string, apiKey: string, config: Record<string, unknown>, retries = 2): Promise<{ success: boolean; code: string; error?: string }> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`[obfuscate] Attempt ${attempt + 1}/${retries + 1} - Creating session...`);
      
      // 1) Create new session
      const sessionRes = await fetch(`${LUAOBFUSCATOR_API}/newscript`, {
        method: "POST",
        headers: {
          apikey: apiKey,
          "content-type": "text",
        },
        body: code,
      });

      if (!sessionRes.ok) {
        const errText = await sessionRes.text();
        console.error(`[obfuscate] newscript failed (attempt ${attempt + 1})`, sessionRes.status, errText);
        if (attempt < retries) continue;
        return { success: false, code, error: "Failed to create session" };
      }

      const sessionText = await sessionRes.text();
      const sessionJson = JSON.parse(sessionText);
      
      if (sessionJson?.message) {
        console.error(`[obfuscate] newscript error (attempt ${attempt + 1})`, sessionJson.message);
        if (attempt < retries) continue;
        return { success: false, code, error: sessionJson.message };
      }

      const sessionId = sessionJson?.sessionId as string | undefined;
      if (!sessionId) {
        console.error(`[obfuscate] No sessionId (attempt ${attempt + 1})`);
        if (attempt < retries) continue;
        return { success: false, code, error: "No sessionId returned" };
      }

      console.log(`[obfuscate] Session created: ${sessionId}, applying obfuscation...`);

      // 2) Apply obfuscation immediately (no delay)
      const obfRes = await fetch(`${LUAOBFUSCATOR_API}/obfuscate`, {
        method: "POST",
        headers: {
          apikey: apiKey,
          sessionId,
          "content-type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!obfRes.ok) {
        const errText = await obfRes.text();
        console.error(`[obfuscate] obfuscate failed (attempt ${attempt + 1})`, obfRes.status, errText);
        if (attempt < retries) continue;
        return { success: false, code, error: "Failed to obfuscate" };
      }

      const obfText = await obfRes.text();
      const obfJson = JSON.parse(obfText);
      
      if (obfJson?.message) {
        console.error(`[obfuscate] obfuscate error (attempt ${attempt + 1})`, obfJson.message);
        // Session not found = retry
        if (obfJson.message.includes("Session not found") && attempt < retries) {
          console.log("[obfuscate] Session expired, retrying...");
          continue;
        }
        if (attempt < retries) continue;
        return { success: false, code, error: obfJson.message };
      }

      const obfuscatedCode = obfJson?.code as string | undefined;
      if (!obfuscatedCode) {
        console.error(`[obfuscate] No code returned (attempt ${attempt + 1})`);
        if (attempt < retries) continue;
        return { success: false, code, error: "No code returned" };
      }

      console.log(`[obfuscate] Success! Output length: ${obfuscatedCode.length}`);
      return { success: true, code: obfuscatedCode };

    } catch (e) {
      console.error(`[obfuscate] Exception (attempt ${attempt + 1})`, e);
      if (attempt < retries) continue;
      return { success: false, code, error: String(e) };
    }
  }

  return { success: false, code, error: "All retry attempts failed" };
}

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

    // Strong but Roblox-compatible obfuscation config
    const defaultConfig = {
      MinifiyAll: true,
      CustomPlugins: {
        EncryptStrings: [90],
        ControlFlowFlattenV1AllBlocks: [50],
        Minifier: true,
        SwizzleLookups: [90],
        MutateAllLiterals: [30]
      }
    };
    const config = body.config ?? defaultConfig;

    // Try API with retries
    const result = await tryObfuscateWithAPI(code, apiKey, config);

    if (result.success) {
      return new Response(JSON.stringify({ code: result.code }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback to local obfuscation if API fails
    console.log("[obfuscate] API failed, using local fallback obfuscation");
    const fallbackCode = localObfuscate(code);
    
    return new Response(JSON.stringify({ code: fallbackCode, fallback: true }), {
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

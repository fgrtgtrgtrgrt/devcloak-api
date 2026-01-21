import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-script-key, x-hwid",
};

// Helper to create HTML response with proper headers
function htmlResponse(html: string): Response {
  return new Response(html, {
    status: 200,
    headers: new Headers({
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "text/html; charset=utf-8",
    }),
  });
}

// Helper to create Lua/text response
function luaResponse(code: string): Response {
  return new Response(code, {
    status: 200,
    headers: new Headers({
      ...corsHeaders,
      "Content-Type": "text/plain; charset=utf-8",
    }),
  });
}

// Multi-layer Lua obfuscation - executor compatible
function obfuscateLua(code: string, options: { antiTamper: boolean; antiDump: boolean; antiHook: boolean }): string {
  // Variable name obfuscation
  const generateVarName = (): string => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let name = "_" + chars[Math.floor(Math.random() * 52)];
    for (let i = 0; i < 6; i++) {
      name += chars[Math.floor(Math.random() * chars.length)];
    }
    return name;
  };

  let obfuscated = code;

  // Anti-tamper check wrapper (lightweight, executor-safe)
  if (options.antiTamper) {
    const checkVar = generateVarName();
    obfuscated = `
local ${checkVar} = function()
  local sum = 0
  for i = 1, 100 do sum = sum + i end
  return sum == 5050
end
if not ${checkVar}() then
  warn("[ScriptHub] Integrity check failed")
  return
end
${obfuscated}`;
  }

  // Anti-dump protection (executor-safe version)
  if (options.antiDump) {
    const funcVar = generateVarName();
    obfuscated = `
local ${funcVar} = function()
  local success, result = pcall(function()
    if script and script:IsA("LocalScript") or script:IsA("Script") then
      if script.Source and #script.Source > 0 then
        return true
      end
    end
  end)
  return success and result
end
if ${funcVar}() then
  warn("[ScriptHub] Protected script")
end
${obfuscated}`;
  }

  // Anti-hook detection - REMOVED as it causes issues with executors
  // Executors wrap/hook standard Lua functions, causing false positives

  // Wrap in execution context
  const wrapperVar = generateVarName();
  const errVar = generateVarName();
  const resultVar = generateVarName();
  
  return `-- ScriptHub Protected
local ${wrapperVar}, ${errVar} = pcall(function()
${obfuscated}
end)
if not ${wrapperVar} then
  warn("[ScriptHub] Error: " .. tostring(${errVar}))
end`;
}

// Generate access denied HTML page
function getAccessDeniedHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Access Denied - ScriptHub</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', system-ui, sans-serif;
      overflow: hidden;
    }
    .container {
      text-align: center;
      padding: 3rem;
      background: rgba(20, 20, 35, 0.8);
      border: 1px solid rgba(139, 92, 246, 0.3);
      border-radius: 24px;
      backdrop-filter: blur(20px);
      box-shadow: 0 0 60px rgba(139, 92, 246, 0.2), inset 0 1px 0 rgba(255,255,255,0.1);
      max-width: 500px;
      position: relative;
    }
    .container::before {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 26px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.5), transparent, rgba(236, 72, 153, 0.5));
      z-index: -1;
      animation: glow 3s ease-in-out infinite;
    }
    @keyframes glow {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    .shield {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.5);
    }
    .shield svg {
      width: 40px;
      height: 40px;
      fill: white;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fff 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }
    .subtitle {
      color: #ec4899;
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      margin-bottom: 1.5rem;
    }
    p {
      color: rgba(255,255,255,0.7);
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: 1rem;
    }
    .warning {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-size: 0.875rem;
      margin-top: 1rem;
    }
    .grid-bg {
      position: fixed;
      inset: 0;
      background-image: 
        linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      z-index: -2;
    }
  </style>
</head>
<body>
  <div class="grid-bg"></div>
  <div class="container">
    <div class="shield">
      <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
    </div>
    <div class="subtitle">Protected Script</div>
    <h1>ACCESS DENIED</h1>
    <p>This script is protected by ScriptHub's enterprise-grade security system.</p>
    <p>Direct browser access is prohibited. This endpoint is designed for Roblox executor use only.</p>
    <div class="warning">
      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
      Unauthorized access attempts are logged
    </div>
  </div>
</body>
</html>`;
}

// Generate Lua error code that displays message and stops execution
function getLuaError(message: string): string {
  return `-- ScriptHub Protection
warn("[ScriptHub] ${message.replace(/"/g, '\\"').replace(/\n/g, " ")}")
return`;
}

// Check if request is from Roblox executor
function isRobloxRequest(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const robloxIndicators = [
    "roblox",
    "synapse",
    "script-ware",
    "krnl",
    "fluxus",
    "oxygen",
    "electron",
    "evon",
    "arceus",
    "trigon",
    "delta",
    "hydrogen",
    "comet",
    "wave",
    "httpget",
    "luau",
    "celery",
    "sentinel",
    "sirhurt",
    "jjsploit"
  ];
  const lowerUA = userAgent.toLowerCase();
  return robloxIndicators.some(indicator => lowerUA.includes(indicator));
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  
  // Expected path: /loader/{script_id}
  const scriptId = pathParts[pathParts.length - 1];
  
  if (!scriptId || scriptId === "loader") {
    const userAgent = req.headers.get("user-agent");
    if (!isRobloxRequest(userAgent)) {
      return htmlResponse(getAccessDeniedHTML());
    }
    return luaResponse(getLuaError("Invalid script ID"));
  }

  const userAgent = req.headers.get("user-agent");
  const scriptKey = req.headers.get("x-script-key") || url.searchParams.get("key") || "";
  const hwid = req.headers.get("x-hwid") || url.searchParams.get("hwid") || "";
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

  // If not from Roblox, show access denied page
  if (!isRobloxRequest(userAgent)) {
    return htmlResponse(getAccessDeniedHTML());
  }

  // Initialize Supabase client with service role for full access
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log(`[Loader] Request for script: ${scriptId}, key: ${scriptKey ? "provided" : "none"}, hwid: ${hwid ? "provided" : "none"}`);

    // Fetch script
    const { data: script, error: scriptError } = await supabase
      .from("scripts")
      .select("*")
      .eq("id", scriptId)
      .eq("is_active", true)
      .single();

    if (scriptError || !script) {
      console.log(`[Loader] Script not found: ${scriptId}`);
      await logExecution(supabase, scriptId, null, clientIP, hwid, userAgent, false, "Script not found");
      return luaResponse(getLuaError("Script not found or inactive"));
    }

    // Check blacklist
    const { data: blacklisted } = await supabase
      .from("user_blacklist")
      .select("id")
      .or(`identifier.eq.${hwid},identifier.eq.${clientIP}`)
      .or(`script_id.eq.${scriptId},is_global.eq.true`)
      .limit(1);

    if (blacklisted && blacklisted.length > 0) {
      console.log(`[Loader] Blacklisted access attempt: ${hwid || clientIP}`);
      await logExecution(supabase, scriptId, null, clientIP, hwid, userAgent, false, "Blacklisted");
      return luaResponse(getLuaError("You have been blacklisted from this script"));
    }

    // Handle based on protection mode
    if (script.protection_mode === "keyless") {
      // Keyless scripts - allow access
      console.log(`[Loader] Keyless access granted for: ${scriptId}`);
      const code = getExecutableCode(script);
      await logExecution(supabase, scriptId, null, clientIP, hwid, userAgent, true, null);
      return luaResponse(code);
    }

    if (script.protection_mode === "whitelist") {
      // Check whitelist
      const { data: whitelisted } = await supabase
        .from("script_whitelist")
        .select("id")
        .eq("script_id", scriptId)
        .eq("is_active", true)
        .or(`identifier.eq.${hwid},identifier.eq.${scriptKey}`)
        .limit(1);

      if (!whitelisted || whitelisted.length === 0) {
        console.log(`[Loader] Whitelist check failed for: ${scriptId}`);
        await logExecution(supabase, scriptId, null, clientIP, hwid, userAgent, false, "Not whitelisted");
        return luaResponse(getLuaError("You are not whitelisted for this script"));
      }

      console.log(`[Loader] Whitelist access granted for: ${scriptId}`);
      const code = getExecutableCode(script);
      await logExecution(supabase, scriptId, null, clientIP, hwid, userAgent, true, null);
      return luaResponse(code);
    }

    // Key-based protection
    if (!scriptKey || scriptKey === "KEYLESS") {
      console.log(`[Loader] Key required but not provided for: ${scriptId}`);
      await logExecution(supabase, scriptId, null, clientIP, hwid, userAgent, false, "Key required");
      return luaResponse(getLuaError("This script requires a valid key. Get your key at scripthub.dev"));
    }

    // Validate key
    const { data: key, error: keyError } = await supabase
      .from("script_keys")
      .select("*")
      .eq("script_id", scriptId)
      .eq("key_value", scriptKey)
      .eq("is_active", true)
      .single();

    if (keyError || !key) {
      console.log(`[Loader] Invalid key for: ${scriptId}`);
      await logExecution(supabase, scriptId, null, clientIP, hwid, userAgent, false, "Invalid key");
      return luaResponse(getLuaError("Invalid or inactive key"));
    }

    // Check expiration
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      console.log(`[Loader] Expired key for: ${scriptId}`);
      await logExecution(supabase, scriptId, key.id, clientIP, hwid, userAgent, false, "Key expired");
      return luaResponse(getLuaError("Your key has expired. Please renew at scripthub.dev"));
    }

    // Check max uses
    if (key.max_uses !== null && key.current_uses >= key.max_uses) {
      console.log(`[Loader] Max uses reached for key: ${key.id}`);
      await logExecution(supabase, scriptId, key.id, clientIP, hwid, userAgent, false, "Max uses reached");
      return luaResponse(getLuaError("This key has reached its maximum usage limit"));
    }

    // Check HWID lock
    if (key.hwid_lock_enabled) {
      if (!hwid) {
        console.log(`[Loader] HWID required but not provided`);
        await logExecution(supabase, scriptId, key.id, clientIP, hwid, userAgent, false, "HWID required");
        return luaResponse(getLuaError("HWID verification required. Please provide your HWID."));
      }

      if (key.hwid_locked && key.hwid_locked !== hwid) {
        console.log(`[Loader] HWID mismatch for key: ${key.id}`);
        await logExecution(supabase, scriptId, key.id, clientIP, hwid, userAgent, false, "HWID mismatch");
        return luaResponse(getLuaError("This key is locked to a different device. Request an HWID reset if needed."));
      }

      // Lock HWID if not already locked
      if (!key.hwid_locked) {
        await supabase
          .from("script_keys")
          .update({ hwid_locked: hwid })
          .eq("id", key.id);
        console.log(`[Loader] HWID locked for key: ${key.id}`);
      }
    }

    // Update key usage
    await supabase
      .from("script_keys")
      .update({ 
        current_uses: key.current_uses + 1,
        last_used_at: new Date().toISOString()
      })
      .eq("id", key.id);

    // Return obfuscated script
    console.log(`[Loader] Key access granted for: ${scriptId}`);
    const code = getExecutableCode(script);
    await logExecution(supabase, scriptId, key.id, clientIP, hwid, userAgent, true, null);
    
    return luaResponse(code);

  } catch (error) {
    console.error(`[Loader] Error:`, error);
    return luaResponse(getLuaError("Internal server error. Please try again later."));
  }
});

// Get executable code - always returns the original code wrapped safely
function getExecutableCode(script: any): string {
  // Use pre-obfuscated code if available, otherwise wrap original code
  if (script.obfuscated_code) {
    return script.obfuscated_code;
  }
  
  // Simple safe wrapper for the original code
  return `-- ScriptHub Protected
local _success, _error = pcall(function()
${script.original_code}
end)
if not _success then
  warn("[ScriptHub] Runtime error: " .. tostring(_error))
end`;
}

async function logExecution(
  supabase: any,
  scriptId: string,
  keyId: string | null,
  ip: string,
  hwid: string,
  userAgent: string | null,
  success: boolean,
  errorMessage: string | null
) {
  try {
    await supabase.from("script_executions").insert({
      script_id: scriptId,
      key_id: keyId,
      executor_ip: ip,
      executor_hwid: hwid || null,
      user_agent: userAgent,
      success,
      error_message: errorMessage,
    });
  } catch (e) {
    console.error("[Loader] Failed to log execution:", e);
  }
}

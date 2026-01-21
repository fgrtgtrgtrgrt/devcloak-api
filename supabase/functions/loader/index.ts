import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-script-key, x-hwid",
};

function redirectToLoaderPage(req: Request, scriptId?: string): Response {
  const url = new URL(req.url);
  const dest = scriptId ? `${url.origin}/loader/${scriptId}` : `${url.origin}/`;
  return Response.redirect(dest, 302);
}

// Helper to create HTML response with proper headers for BROWSER rendering
function htmlResponse(html: string, status: number = 403): Response {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

// Helper to create Lua/text response for EXECUTORS
function luaResponse(code: string): Response {
  return new Response(code, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    },
  });
}

// LuaObfuscator.com API integration (free, no API key required with "test" key)
const LUAOBFUSCATOR_API = "https://api.luaobfuscator.com/v1/obfuscator";

interface ObfuscationResult {
  success: boolean;
  code: string;
  error?: string;
}

// Call LuaObfuscator.com API for professional obfuscation
async function obfuscateWithAPI(code: string): Promise<ObfuscationResult> {
  try {
    // Step 1: Create a new session with the script
    const sessionResponse = await fetch(`${LUAOBFUSCATOR_API}/newscript`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        "apikey": "test",
      },
      body: code,
    });

    if (!sessionResponse.ok) {
      console.error("[Obfuscator] Failed to create session:", sessionResponse.status);
      return { success: false, code, error: "Failed to create obfuscation session" };
    }

    const sessionData = await sessionResponse.json();
    
    if (sessionData.message) {
      console.error("[Obfuscator] Session error:", sessionData.message);
      return { success: false, code, error: sessionData.message };
    }

    const sessionId = sessionData.sessionId;
    if (!sessionId) {
      console.error("[Obfuscator] No session ID returned");
      return { success: false, code, error: "No session ID returned" };
    }

    // Step 2: Apply obfuscation with strong settings
    const obfuscateResponse = await fetch(`${LUAOBFUSCATOR_API}/obfuscate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": "test",
        "sessionId": sessionId,
      },
      body: JSON.stringify({
        // Variable/literal obfuscation
        "MinifyAll": true,
        "EncryptStrings": true,
        
        // Control flow obfuscation
        "Virtualize": true,
        
        // Additional protection layers
        "ConstantArray": true,
        "ProxifyLocals": true,
        "PaidWatermark": false,
        "ByteCodeMode": "Default",
      }),
    });

    if (!obfuscateResponse.ok) {
      console.error("[Obfuscator] Failed to obfuscate:", obfuscateResponse.status);
      return { success: false, code, error: "Failed to apply obfuscation" };
    }

    const obfuscateData = await obfuscateResponse.json();

    if (obfuscateData.message) {
      console.error("[Obfuscator] Obfuscation error:", obfuscateData.message);
      return { success: false, code, error: obfuscateData.message };
    }

    if (!obfuscateData.code) {
      console.error("[Obfuscator] No obfuscated code returned");
      return { success: false, code, error: "No obfuscated code returned" };
    }

    console.log("[Obfuscator] Successfully obfuscated script via LuaObfuscator.com API");
    return { success: true, code: obfuscateData.code };

  } catch (error) {
    console.error("[Obfuscator] API error:", error);
    return { success: false, code, error: String(error) };
  }
}

// Fallback local obfuscation if API fails
function localObfuscate(code: string): string {
  const generateVarName = (): string => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let name = "_" + chars[Math.floor(Math.random() * 52)];
    for (let i = 0; i < 6; i++) {
      name += chars[Math.floor(Math.random() * chars.length)];
    }
    return name;
  };

  // Basic string encoding
  const encodeString = (str: string): string => {
    const key = Math.floor(Math.random() * 200) + 55;
    const bytes = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i) ^ key);
    }
    return `(function(t,k) local r="" for i=1,#t do r=r..string.char(bit32 and bit32.bxor(t[i],k) or ((t[i]+256-k)%256)) end return r end)({${bytes.join(",")}},${key})`;
  };

  // Basic variable renaming
  const varMap = new Map<string, string>();
  const reserved = new Set(['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while', 'game', 'workspace', 'script', 'wait', 'spawn', 'task', 'pcall', 'print', 'warn', 'error', 'pairs', 'ipairs', 'tostring', 'tonumber', 'type', 'typeof', 'setmetatable', 'getmetatable', 'rawget', 'rawset', 'string', 'table', 'math', 'bit32', 'coroutine', 'Instance', 'Vector3', 'Vector2', 'CFrame', 'Color3', 'Enum', '_G', 'shared', 'loadstring', 'getfenv', 'setfenv']);

  let obfuscated = code;

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

  // Wrap in execution context
  const wrapperVar = generateVarName();
  const errVar = generateVarName();

  return `-- ScriptHub Protected (Fallback)
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
      // Browser: send to the real website page instead of returning raw HTML
      return redirectToLoaderPage(req);
    }
    return luaResponse(getLuaError("Invalid script ID"));
  }

  const userAgent = req.headers.get("user-agent");
  const scriptKey = url.searchParams.get("key") || "";
  const hwid = url.searchParams.get("hwid") || "";
  const action = url.searchParams.get("action") || "";
  const clientIP = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";

  // Handle HWID reporting/verification from embedded script
  if (action === "report" && hwid) {
    console.log(`[Loader] HWID reported: ${hwid} for script ${scriptId}`);
    // Best-effort: backfill HWID into the most recent execution log for this script/IP.
    // The initial loader request often can't include HWID (it's detected after download).
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: lastExec } = await supabase
        .from("script_executions")
        .select("id, executor_hwid")
        .eq("script_id", scriptId)
        .eq("executor_ip", clientIP)
        .order("executed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastExec?.id && !lastExec.executor_hwid) {
        await supabase
          .from("script_executions")
          .update({ executor_hwid: hwid })
          .eq("id", lastExec.id);
      }
    } catch (e) {
      console.error("[Loader] Failed to backfill HWID into execution log:", e);
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  // Handle HWID verification for locked keys
  if (action === "verify" && hwid) {
    const keyToVerify = url.searchParams.get("key") || "";
    console.log(`[Loader] HWID verify request: ${hwid} for key: ${keyToVerify}`);
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Look up the key
    const { data: key, error: keyError } = await supabase
      .from("script_keys")
      .select("*")
      .eq("script_id", scriptId)
      .eq("key_value", keyToVerify)
      .eq("is_active", true)
      .single();
    
    if (keyError || !key) {
      return new Response("invalid", { status: 200, headers: corsHeaders });
    }
    
    if (!key.hwid_lock_enabled) {
      return new Response("ok", { status: 200, headers: corsHeaders });
    }
    
    // Check if already locked to different HWID
    if (key.hwid_locked && key.hwid_locked !== hwid) {
      return new Response("locked", { status: 200, headers: corsHeaders });
    }
    
    // Lock HWID if not already locked
    if (!key.hwid_locked) {
      await supabase
        .from("script_keys")
        .update({ hwid_locked: hwid })
        .eq("id", key.id);
      console.log(`[Loader] HWID locked for key: ${key.id}`);
    }
    
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  // If not from Roblox, show access denied page
  if (!isRobloxRequest(userAgent)) {
    // Browser: always route to the website's Loader page (renders Access Denied UI)
    return redirectToLoaderPage(req, scriptId);
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

    // Build the loader URL for HWID reporting
    const loaderUrl = `${url.origin}${url.pathname}`;

    // Handle based on protection mode
    if (script.protection_mode === "keyless") {
      // Keyless scripts - allow access
      console.log(`[Loader] Keyless access granted for: ${scriptId}`);
      const code = await getExecutableCode(script, loaderUrl, scriptId);
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
      const code = await getExecutableCode(script, loaderUrl, scriptId);
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

    // HWID lock is now handled in the embedded script - skip server-side check
    // The embedded script will detect HWID and verify with the server before executing

    // Update key usage
    await supabase
      .from("script_keys")
      .update({ 
        current_uses: key.current_uses + 1,
        last_used_at: new Date().toISOString()
      })
      .eq("id", key.id);

    // Return obfuscated script with embedded HWID handling
    console.log(`[Loader] Key access granted for: ${scriptId}`);
    const code = await getExecutableCode(script, loaderUrl, scriptId, {
      keyValue: scriptKey,
      hwidLockEnabled: key.hwid_lock_enabled
    });
    await logExecution(supabase, scriptId, key.id, clientIP, hwid, userAgent, true, null);
    
    return luaResponse(code);

  } catch (error) {
    console.error(`[Loader] Error:`, error);
    return luaResponse(getLuaError("Internal server error. Please try again later."));
  }
});

// Get executable code with HWID detection embedded and API obfuscation
interface KeyOptions {
  keyValue?: string;
  hwidLockEnabled?: boolean;
}

async function getExecutableCode(script: any, loaderUrl: string, scriptId: string, keyOptions?: KeyOptions): Promise<string> {
  // Generate random variable names to hide the HWID detection
  const generateVarName = (): string => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let name = "_" + chars[Math.floor(Math.random() * 52)];
    for (let i = 0; i < 6; i++) {
      name += chars[Math.floor(Math.random() * chars.length)];
    }
    return name;
  };

  const hwidVar = generateVarName();
  const httpVar = generateVarName();
  const gameVar = generateVarName();
  const playerVar = generateVarName();
  const successVar = generateVarName();
  const errorVar = generateVarName();
  const verifyVar = generateVarName();
  const resultVar = generateVarName();

  // Get the script code - prefer obfuscated if available
  let scriptCode = script.obfuscated_code || script.original_code;

  // If no pre-obfuscated code, obfuscate now via API
  if (!script.obfuscated_code && script.original_code) {
    console.log("[Loader] Obfuscating script via LuaObfuscator.com API...");
    const obfResult = await obfuscateWithAPI(script.original_code);
    if (obfResult.success) {
      scriptCode = obfResult.code;
    } else {
      console.log("[Loader] API obfuscation failed, using local fallback");
      scriptCode = localObfuscate(script.original_code);
    }
  }

  // Build HWID verification code for key-protected scripts with HWID lock
  let hwidVerification = "";
  if (keyOptions?.hwidLockEnabled && keyOptions?.keyValue) {
    hwidVerification = `
-- HWID verification (embedded)
local ${verifyVar} = nil
pcall(function()
  local ${resultVar} = ${httpVar}:RequestAsync({
    Url = "${loaderUrl}?hwid=" .. ${hwidVar} .. "&key=${keyOptions.keyValue}&action=verify",
    Method = "GET"
  })
  ${verifyVar} = ${resultVar} and ${resultVar}.Body
end)
if ${verifyVar} == "locked" then
  warn("[ScriptHub] This key is locked to a different device")
  return
elseif ${verifyVar} == "invalid" then
  warn("[ScriptHub] Invalid key")
  return
end
`;
  }

  // Embed HWID detection directly into the script - hidden among obfuscated variable names
  const wrapperCode = `-- ScriptHub Protected
local ${gameVar} = game
local ${httpVar} = ${gameVar}:GetService("HttpService")
local ${playerVar} = ${gameVar}:GetService("Players").LocalPlayer

-- Hardware identification (embedded)
local ${hwidVar} = ""
pcall(function()
  ${hwidVar} = ${gameVar}:GetService("RbxAnalyticsService"):GetClientId()
end)
if ${hwidVar} == "" then
  pcall(function()
    ${hwidVar} = ${httpVar}:GenerateGUID(false)
  end)
end

-- Report HWID silently
pcall(function()
  ${httpVar}:RequestAsync({
    Url = "${loaderUrl}?hwid=" .. ${hwidVar} .. "&action=report",
    Method = "POST",
    Headers = {["Content-Type"] = "application/json"},
    Body = ${httpVar}:JSONEncode({hwid = ${hwidVar}, player = ${playerVar} and ${playerVar}.Name or "unknown"})
  })
end)
${hwidVerification}
-- Execute protected script
local ${successVar}, ${errorVar} = pcall(function()
${scriptCode}
end)
if not ${successVar} then
  warn("[ScriptHub] Runtime error: " .. tostring(${errorVar}))
end`;

  return wrapperCode;
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

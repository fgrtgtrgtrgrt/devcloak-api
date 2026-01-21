// LuaObfuscator.com API integration - free obfuscation
const LUAOBFUSCATOR_API = "https://api.luaobfuscator.com/v1/obfuscator";

// Generate random variable name (for fallback)
export function generateVarName(prefix = "_"): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let name = prefix + chars[Math.floor(Math.random() * 52)];
  for (let i = 0; i < 7 + Math.floor(Math.random() * 5); i++) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }
  return name;
}

interface ObfuscationResult {
  success: boolean;
  code: string;
  error?: string;
}

// Call LuaObfuscator.com API for professional obfuscation
export async function obfuscateWithAPI(code: string): Promise<ObfuscationResult> {
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
  // Basic string encoding
  const encodeString = (str: string, key: number): number[] => {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i) ^ key);
    }
    return bytes;
  };

  // Reserved Lua keywords and Roblox globals
  const reserved = new Set([
    'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
    'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true',
    'until', 'while', 'goto', 'game', 'workspace', 'script', 'wait', 'spawn',
    'delay', 'tick', 'time', 'typeof', 'type', 'pairs', 'ipairs', 'next',
    'select', 'unpack', 'pack', 'rawget', 'rawset', 'rawequal', 'setmetatable',
    'getmetatable', 'pcall', 'xpcall', 'error', 'assert', 'warn', 'print',
    'tostring', 'tonumber', 'string', 'table', 'math', 'bit32', 'coroutine',
    'debug', 'os', 'utf8', 'Instance', 'Vector3', 'Vector2', 'CFrame', 'Color3',
    'BrickColor', 'UDim', 'UDim2', 'Enum', 'Ray', 'Region3', 'Rect', 'TweenInfo',
    'NumberSequence', 'ColorSequence', 'NumberRange', 'task', 'require', '_G',
    'shared', 'loadstring', 'getfenv', 'setfenv', 'newproxy'
  ]);

  let obfuscated = code;
  const varMap = new Map<string, string>();

  // Find and rename local variables
  const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
  let match;
  while ((match = localPattern.exec(code)) !== null) {
    const varName = match[1];
    if (!reserved.has(varName) && !varMap.has(varName)) {
      varMap.set(varName, generateVarName("_v"));
    }
  }

  // Find function parameter names
  const funcPattern = /\bfunction\s*\([^)]*\)/g;
  while ((match = funcPattern.exec(code)) !== null) {
    const params = match[0].match(/\(([^)]*)\)/);
    if (params && params[1]) {
      const paramNames = params[1].split(',').map(p => p.trim()).filter(p => p);
      for (const param of paramNames) {
        if (!reserved.has(param) && !varMap.has(param)) {
          varMap.set(param, generateVarName("_p"));
        }
      }
    }
  }

  // Apply variable renaming
  for (const [original, renamed] of varMap) {
    const regex = new RegExp(`\\b${original}\\b`, 'g');
    obfuscated = obfuscated.replace(regex, renamed);
  }

  // Wrap in execution context with pcall
  const wrapperVar = generateVarName("_w");
  const errVar = generateVarName("_e");

  return `-- ScriptHub Protected (Fallback)
local ${wrapperVar}, ${errVar} = pcall(function()
${obfuscated}
end)
if not ${wrapperVar} then
  warn("[ScriptHub] Error: " .. tostring(${errVar}))
end`;
}

interface ObfuscationOptions {
  antiTamper?: boolean;
  antiDump?: boolean;
  antiHook?: boolean;
  stringEncryption?: boolean;
  variableRenaming?: boolean;
  deadCodeInsertion?: boolean;
  controlFlowFlattening?: boolean;
  closureWrapping?: boolean;
  metatableProtection?: boolean;
}

// Main obfuscation function - tries API first, falls back to local
export async function obfuscateLuaAsync(code: string, _options: ObfuscationOptions = {}): Promise<string> {
  // Try API obfuscation first
  const result = await obfuscateWithAPI(code);
  
  if (result.success) {
    return result.code;
  }
  
  // Fall back to local obfuscation
  console.log("[Obfuscator] API failed, using local fallback");
  return localObfuscate(code);
}

// Synchronous fallback for existing code that can't be async
export function obfuscateLua(code: string, _options: ObfuscationOptions = {}): string {
  return localObfuscate(code);
}

// Preview obfuscation (lighter version for display)
export function previewObfuscation(code: string): string {
  const lines = code.split('\n').slice(0, 5);
  return lines.join('\n') + '\n-- ... (obfuscated content hidden)';
}

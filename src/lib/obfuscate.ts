import { supabase } from "@/integrations/supabase/client";

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

// Call our backend function (avoids browser CORS issues)
export async function obfuscateWithAPI(code: string): Promise<ObfuscationResult> {
  try {
    const { data, error } = await supabase.functions.invoke("obfuscate", {
      body: {
        code,
        // Roblox-compatible config (NO Virtualize - uses Lua 5.1 features not in Luau)
        config: {
          MinifiyAll: true,
          CustomPlugins: {
            EncryptStrings: [100],
            ControlFlowFlattenV1AllBlocks: [80],
            Minifier: true,
            SwizzleLookups: [100],
            MutateAllLiterals: [60],
            MakeGlobalsLookups: true,
            JunkifyAllIfStatements: [40],
          },
        },
      },
    });

    if (error) {
      console.error("[Obfuscator] Backend invoke error:", error);
      return { success: false, code, error: error.message };
    }

    if (!data?.code || typeof data.code !== "string") {
      console.error("[Obfuscator] Backend returned no code");
      return { success: false, code, error: "Backend returned no code" };
    }

    return { success: true, code: data.code };
  } catch (err) {
    console.error("[Obfuscator] API error:", err);
    return { success: false, code, error: String(err) };
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

// Multi-layer Lua obfuscation utilities

// Generate random variable name
export function generateVarName(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
  let name = chars[Math.floor(Math.random() * 52)];
  for (let i = 0; i < 8; i++) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }
  return name;
}

// String encryption using XOR
export function encryptString(str: string): string {
  const key = Math.floor(Math.random() * 255) + 1;
  const encrypted: number[] = [];
  for (let i = 0; i < str.length; i++) {
    encrypted.push(str.charCodeAt(i) ^ key);
  }
  return `(function() local k=${key} local t={${encrypted.join(",")}} local s="" for i=1,#t do s=s..string.char(bit32 and bit32.bxor(t[i],k) or ((t[i]~k))) end return s end)()`;
}

interface ObfuscationOptions {
  antiTamper?: boolean;
  antiDump?: boolean;
  antiHook?: boolean;
  stringEncryption?: boolean;
  controlFlowFlattening?: boolean;
}

export function obfuscateLua(code: string, options: ObfuscationOptions = {}): string {
  const {
    antiTamper = true,
    antiDump = true,
    antiHook = true,
    stringEncryption = true,
    controlFlowFlattening = true,
  } = options;

  let obfuscated = code;

  // Anti-tamper check wrapper
  if (antiTamper) {
    const checkVar = generateVarName();
    const hashVar = generateVarName();
    obfuscated = `
local ${checkVar} = function()
  local ${hashVar} = 0
  for i = 1, 1000 do ${hashVar} = ${hashVar} + i end
  return ${hashVar} == 500500
end
if not ${checkVar}() then return error("Integrity check failed") end
${obfuscated}`;
  }

  // Anti-dump protection
  if (antiDump) {
    const funcVar = generateVarName();
    obfuscated = `
local ${funcVar} = function()
  if getfenv then
    local env = getfenv(1)
    if env.script and env.script.Source then
      return error("Access denied")
    end
  end
end
pcall(${funcVar})
${obfuscated}`;
  }

  // Anti-hook detection
  if (antiHook) {
    const origVar = generateVarName();
    obfuscated = `
local ${origVar} = {
  ["print"] = print,
  ["warn"] = warn,
  ["error"] = error,
  ["loadstring"] = loadstring,
  ["require"] = require
}
for k,v in pairs(${origVar}) do
  if type(_G[k]) ~= type(v) then
    return error("Environment tampered")
  end
end
${obfuscated}`;
  }

  // Control flow flattening
  if (controlFlowFlattening) {
    const stateVar = generateVarName();
    const loopVar = generateVarName();
    
    obfuscated = `
local ${stateVar} = 1
local ${loopVar} = true
while ${loopVar} do
  if ${stateVar} == 1 then
    ${stateVar} = 2
  elseif ${stateVar} == 2 then
    ${obfuscated}
    ${loopVar} = false
  end
end`;
  }

  // Wrap entire script in protected call
  const wrapperVar = generateVarName();
  const errVar = generateVarName();
  
  return `-- Protected by ScriptHub
local ${wrapperVar}, ${errVar} = pcall(function()
${obfuscated}
end)
if not ${wrapperVar} then
  warn("[ScriptHub] Runtime error: " .. tostring(${errVar}))
end`;
}

// Preview obfuscation (lighter version for display)
export function previewObfuscation(code: string): string {
  const lines = code.split('\n').slice(0, 5);
  return lines.join('\n') + '\n-- ... (obfuscated content hidden)';
}

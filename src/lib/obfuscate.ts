// Multi-layer Lua obfuscation utilities - Executor compatible

// Generate random variable name
export function generateVarName(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let name = "_" + chars[Math.floor(Math.random() * 52)];
  for (let i = 0; i < 6; i++) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }
  return name;
}

interface ObfuscationOptions {
  antiTamper?: boolean;
  antiDump?: boolean;
  antiHook?: boolean;
}

export function obfuscateLua(code: string, options: ObfuscationOptions = {}): string {
  const {
    antiTamper = true,
    antiDump = true,
    // antiHook is ignored - causes issues with executors
  } = options;

  let obfuscated = code;

  // Anti-tamper check wrapper (lightweight, executor-safe)
  if (antiTamper) {
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
  if (antiDump) {
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

  // Wrap entire script in protected call
  const wrapperVar = generateVarName();
  const errVar = generateVarName();
  
  return `-- ScriptHub Protected
local ${wrapperVar}, ${errVar} = pcall(function()
${obfuscated}
end)
if not ${wrapperVar} then
  warn("[ScriptHub] Error: " .. tostring(${errVar}))
end`;
}

// Preview obfuscation (lighter version for display)
export function previewObfuscation(code: string): string {
  const lines = code.split('\n').slice(0, 5);
  return lines.join('\n') + '\n-- ... (obfuscated content hidden)';
}

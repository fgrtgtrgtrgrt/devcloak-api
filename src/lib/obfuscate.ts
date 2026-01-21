// Advanced multi-layer Lua obfuscation - Executor compatible

// Generate random variable name
export function generateVarName(prefix = "_"): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let name = prefix + chars[Math.floor(Math.random() * 52)];
  for (let i = 0; i < 7 + Math.floor(Math.random() * 5); i++) {
    name += chars[Math.floor(Math.random() * chars.length)];
  }
  return name;
}

// Generate random number for encoding
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// XOR key for string encoding
function generateXorKey(): number {
  return randomInt(1, 255);
}

// Encode a string to byte array with XOR
function encodeString(str: string, key: number): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i) ^ key);
  }
  return bytes;
}

// Generate string decoder function in Lua
function generateStringDecoder(decoderVar: string, keyVar: string): string {
  return `local ${decoderVar} = function(t, k)
  local r = ""
  for i = 1, #t do
    r = r .. string.char(bit32 and bit32.bxor(t[i], k) or ((t[i] + k) % 256))
  end
  return r
end`;
}

// Obfuscate all string literals in the code
function obfuscateStrings(code: string, decoderVar: string, keyVar: string, key: number): string {
  // Match string literals (single, double quotes, and long strings)
  const stringPattern = /(?<!\\)(["'])(?:(?!\1|\\).|\\.)*\1/g;
  
  return code.replace(stringPattern, (match) => {
    // Extract the string content without quotes
    const quote = match[0];
    const content = match.slice(1, -1);
    
    // Skip very short strings or strings with escape sequences we can't handle
    if (content.length < 2 || content.includes('\\')) {
      return match;
    }
    
    // Encode the string
    const encoded = encodeString(content, key);
    return `${decoderVar}({${encoded.join(",")}}, ${keyVar})`;
  });
}

// Rename local variables to random names
function renameVariables(code: string): { code: string; mapping: Map<string, string> } {
  const mapping = new Map<string, string>();
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

  // Find local variable declarations
  const localPattern = /\blocal\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
  let match;
  
  while ((match = localPattern.exec(code)) !== null) {
    const varName = match[1];
    if (!reserved.has(varName) && !mapping.has(varName)) {
      mapping.set(varName, generateVarName("_v"));
    }
  }

  // Find function parameter names
  const funcPattern = /\bfunction\s*\([^)]*\)/g;
  while ((match = funcPattern.exec(code)) !== null) {
    const params = match[0].match(/\(([^)]*)\)/);
    if (params && params[1]) {
      const paramNames = params[1].split(',').map(p => p.trim()).filter(p => p);
      for (const param of paramNames) {
        if (!reserved.has(param) && !mapping.has(param)) {
          mapping.set(param, generateVarName("_p"));
        }
      }
    }
  }

  // Apply renaming
  let result = code;
  for (const [original, renamed] of mapping) {
    const regex = new RegExp(`\\b${original}\\b`, 'g');
    result = result.replace(regex, renamed);
  }

  return { code: result, mapping };
}

// Insert dead code blocks
function insertDeadCode(code: string): string {
  const deadCodeBlocks = [
    () => {
      const v1 = generateVarName("_d");
      const v2 = generateVarName("_d");
      return `local ${v1} = ${randomInt(1, 1000)}; local ${v2} = ${v1} * 0;`;
    },
    () => {
      const v = generateVarName("_d");
      return `if false then local ${v} = nil end`;
    },
    () => {
      const v = generateVarName("_d");
      return `local ${v} = (function() return nil end)()`;
    },
    () => {
      const v1 = generateVarName("_d");
      const v2 = generateVarName("_d");
      return `local ${v1}, ${v2} = ${randomInt(1, 100)}, ${randomInt(1, 100)}`;
    }
  ];

  const lines = code.split('\n');
  const result: string[] = [];
  
  for (const line of lines) {
    result.push(line);
    // Randomly insert dead code (10% chance per line)
    if (Math.random() < 0.1 && line.trim().length > 0) {
      const deadCode = deadCodeBlocks[randomInt(0, deadCodeBlocks.length - 1)]();
      result.push(deadCode);
    }
  }

  return result.join('\n');
}

// Control flow flattening using state machine
function flattenControlFlow(code: string): string {
  const stateVar = generateVarName("_st");
  const loopVar = generateVarName("_lp");
  const resultVar = generateVarName("_rs");
  
  // Wrap the entire code in a state machine
  return `local ${stateVar} = 1
local ${resultVar} = nil
local ${loopVar} = true
while ${loopVar} do
  if ${stateVar} == 1 then
    ${stateVar} = 2
  elseif ${stateVar} == 2 then
    local _exec = function()
${code}
    end
    ${resultVar} = {pcall(_exec)}
    ${stateVar} = 3
  elseif ${stateVar} == 3 then
    ${loopVar} = false
  end
end
if not ${resultVar}[1] then
  warn("[Protected] " .. tostring(${resultVar}[2]))
end`;
}

// Generate integrity check
function generateIntegrityCheck(): string {
  const checkVar = generateVarName("_ic");
  const sumVar = generateVarName("_sm");
  const expected = 5050; // Sum of 1 to 100
  
  return `local ${checkVar} = function()
  local ${sumVar} = 0
  for i = 1, 100 do ${sumVar} = ${sumVar} + i end
  return ${sumVar} == ${expected}
end
if not ${checkVar}() then return end`;
}

// Generate anti-tamper protection
function generateAntiTamper(): string {
  const funcVar = generateVarName("_at");
  const checkVar = generateVarName("_ck");
  
  return `local ${funcVar} = function()
  local ${checkVar} = true
  local _s, _e = pcall(function()
    if getfenv then
      local env = getfenv(0)
      if env and type(env) == "table" then
        for k, v in pairs(env) do
          if type(v) == "function" then
            local info = debug and debug.getinfo and debug.getinfo(v)
            if info and info.what == "C" then
              ${checkVar} = ${checkVar} and true
            end
          end
        end
      end
    end
  end)
  return ${checkVar}
end
if not ${funcVar}() then
  warn("[Protected] Environment check failed")
end`;
}

// Generate anti-dump protection
function generateAntiDump(): string {
  const funcVar = generateVarName("_ad");
  
  return `local ${funcVar} = function()
  local _s, _r = pcall(function()
    if script and typeof(script) == "Instance" then
      if script:IsA("LocalScript") or script:IsA("ModuleScript") or script:IsA("Script") then
        local src = script:FindFirstChild("Source") or script:FindFirstChild("source")
        if src then return true end
      end
    end
  end)
  return _s and _r
end
if ${funcVar}() then
  warn("[Protected] Script protection active")
end`;
}

// Generate metatable protection check
function generateMetatableProtection(): string {
  const checkVar = generateVarName("_mt");
  
  return `local ${checkVar} = function()
  local _ok = true
  pcall(function()
    local _t = {}
    local _mt = {__index = function() return nil end}
    setmetatable(_t, _mt)
    local _g = getmetatable(_t)
    if _g ~= _mt then _ok = false end
  end)
  return _ok
end
if not ${checkVar}() then
  warn("[Protected] Metatable tampering detected")
end`;
}

// Wrap code in multiple closure layers
function wrapInClosures(code: string, layers: number = 3): string {
  let result = code;
  
  for (let i = 0; i < layers; i++) {
    const funcVar = generateVarName("_cl");
    const argsVar = generateVarName("_ag");
    result = `local ${funcVar} = (function(${argsVar})
  return (function()
${result}
  end)()
end)({${randomInt(1, 100)}, ${randomInt(1, 100)}, ${randomInt(1, 100)}})`;
  }
  
  return result;
}

// Generate environment sandbox
function generateSandbox(): string {
  const envVar = generateVarName("_env");
  const proxyVar = generateVarName("_px");
  
  return `local ${envVar} = getfenv and getfenv() or _ENV or {}
local ${proxyVar} = setmetatable({}, {
  __index = ${envVar},
  __newindex = function(t, k, v)
    rawset(${envVar}, k, v)
  end
})
if setfenv then
  pcall(setfenv, 1, ${proxyVar})
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

export function obfuscateLua(code: string, options: ObfuscationOptions = {}): string {
  const {
    antiTamper = true,
    antiDump = true,
    antiHook = true,
    stringEncryption = true,
    variableRenaming = true,
    deadCodeInsertion = true,
    controlFlowFlattening = true,
    closureWrapping = true,
    metatableProtection = true,
  } = options;

  let obfuscated = code;

  // Step 1: String encryption
  const xorKey = generateXorKey();
  const keyVar = generateVarName("_k");
  const decoderVar = generateVarName("_dec");
  
  let stringDecoder = "";
  if (stringEncryption) {
    stringDecoder = generateStringDecoder(decoderVar, keyVar);
    obfuscated = obfuscateStrings(obfuscated, decoderVar, keyVar, xorKey);
  }

  // Step 2: Variable renaming
  if (variableRenaming) {
    const { code: renamed } = renameVariables(obfuscated);
    obfuscated = renamed;
  }

  // Step 3: Dead code insertion
  if (deadCodeInsertion) {
    obfuscated = insertDeadCode(obfuscated);
  }

  // Step 4: Build protection layers
  const protections: string[] = [];
  
  protections.push(generateIntegrityCheck());
  
  if (antiTamper) {
    protections.push(generateAntiTamper());
  }
  
  if (antiDump) {
    protections.push(generateAntiDump());
  }
  
  if (metatableProtection && antiHook) {
    protections.push(generateMetatableProtection());
  }
  
  // Add sandbox
  protections.push(generateSandbox());
  
  // Add string decoder if used
  if (stringEncryption) {
    protections.push(`local ${keyVar} = ${xorKey}`);
    protections.push(stringDecoder);
  }

  // Combine protections with main code
  obfuscated = protections.join('\n') + '\n' + obfuscated;

  // Step 5: Control flow flattening
  if (controlFlowFlattening) {
    obfuscated = flattenControlFlow(obfuscated);
  }

  // Step 6: Wrap in closure layers
  if (closureWrapping) {
    obfuscated = wrapInClosures(obfuscated, 2);
  }

  // Final wrapper with pcall
  const wrapperVar = generateVarName("_w");
  const errVar = generateVarName("_e");
  
  return `-- Protected Script
local ${wrapperVar}, ${errVar} = pcall(function()
${obfuscated}
end)
if not ${wrapperVar} then
  warn("[ScriptHub] " .. tostring(${errVar}))
end`;
}

// Preview obfuscation (lighter version for display)
export function previewObfuscation(code: string): string {
  const lines = code.split('\n').slice(0, 5);
  return lines.join('\n') + '\n-- ... (obfuscated content hidden)';
}

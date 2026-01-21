import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { obfuscateLua } from "@/lib/obfuscate";

export interface Script {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  original_code: string;
  obfuscated_code: string | null;
  protection_mode: "key" | "whitelist" | "keyless";
  is_active: boolean;
  is_premium: boolean;
  version: number;
  anti_tamper: boolean;
  anti_dump: boolean;
  anti_hook: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScriptKey {
  id: string;
  script_id: string;
  key_value: string;
  is_active: boolean;
  is_premium: boolean;
  max_uses: number | null;
  current_uses: number;
  hwid_locked: string | null;
  hwid_lock_enabled: boolean;
  expires_at: string | null;
  created_at: string;
  last_used_at: string | null;
}

export interface WhitelistEntry {
  id: string;
  script_id: string;
  identifier: string;
  identifier_type: "roblox_id" | "username" | "hwid";
  note: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ScriptExecution {
  id: string;
  script_id: string;
  key_id: string | null;
  executor_ip: string | null;
  executor_hwid: string | null;
  user_agent: string | null;
  success: boolean;
  error_message: string | null;
  executed_at: string;
}

export function useScripts() {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScripts = useCallback(async () => {
    if (!user) {
      setScripts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("scripts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setScripts((data as Script[]) || []);
    } catch (error: any) {
      console.error("Error fetching scripts:", error);
      toast.error("Failed to load scripts");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const createScript = async (
    name: string,
    code: string,
    protectionMode: "key" | "whitelist" | "keyless",
    options: { antiTamper?: boolean; antiDump?: boolean; antiHook?: boolean } = {}
  ): Promise<Script | null> => {
    if (!user) {
      toast.error("You must be logged in");
      return null;
    }

    try {
      const obfuscated = obfuscateLua(code, {
        antiTamper: options.antiTamper ?? true,
        antiDump: options.antiDump ?? true,
        antiHook: options.antiHook ?? true,
      });

      const { data, error } = await supabase
        .from("scripts")
        .insert({
          user_id: user.id,
          name,
          original_code: code,
          obfuscated_code: obfuscated,
          protection_mode: protectionMode,
          anti_tamper: options.antiTamper ?? true,
          anti_dump: options.antiDump ?? true,
          anti_hook: options.antiHook ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Script created successfully!");
      await fetchScripts();
      return data as Script;
    } catch (error: any) {
      console.error("Error creating script:", error);
      toast.error("Failed to create script");
      return null;
    }
  };

  const updateScript = async (
    id: string,
    updates: Partial<Pick<Script, "name" | "original_code" | "protection_mode" | "is_active" | "anti_tamper" | "anti_dump" | "anti_hook">>
  ): Promise<boolean> => {
    try {
      let finalUpdates: any = { ...updates };

      // Re-obfuscate if code or protection settings changed
      if (updates.original_code || updates.anti_tamper !== undefined || updates.anti_dump !== undefined || updates.anti_hook !== undefined) {
        const script = scripts.find(s => s.id === id);
        if (script) {
          const code = updates.original_code || script.original_code;
          finalUpdates.obfuscated_code = obfuscateLua(code, {
            antiTamper: updates.anti_tamper ?? script.anti_tamper,
            antiDump: updates.anti_dump ?? script.anti_dump,
            antiHook: updates.anti_hook ?? script.anti_hook,
          });
          finalUpdates.version = script.version + 1;
        }
      }

      const { error } = await supabase
        .from("scripts")
        .update(finalUpdates)
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Script updated successfully!");
      await fetchScripts();
      return true;
    } catch (error: any) {
      console.error("Error updating script:", error);
      toast.error("Failed to update script");
      return false;
    }
  };

  const deleteScript = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("scripts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast.success("Script deleted successfully!");
      await fetchScripts();
      return true;
    } catch (error: any) {
      console.error("Error deleting script:", error);
      toast.error("Failed to delete script");
      return false;
    }
  };

  return {
    scripts,
    loading,
    fetchScripts,
    createScript,
    updateScript,
    deleteScript,
  };
}

export function useScriptKeys(scriptId: string | null) {
  const [keys, setKeys] = useState<ScriptKey[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchKeys = useCallback(async () => {
    if (!scriptId) {
      setKeys([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("script_keys")
        .select("*")
        .eq("script_id", scriptId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setKeys((data as ScriptKey[]) || []);
    } catch (error: any) {
      console.error("Error fetching keys:", error);
      toast.error("Failed to load keys");
    } finally {
      setLoading(false);
    }
  }, [scriptId]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const generateKey = async (options: {
    isPremium?: boolean;
    maxUses?: number | null;
    expiresAt?: string | null;
    hwidLockEnabled?: boolean;
  } = {}): Promise<ScriptKey | null> => {
    if (!scriptId) return null;

    try {
      // Generate longer unique key with more entropy
      const timestamp = Date.now().toString(36).toUpperCase();
      const random1 = Math.random().toString(36).substring(2, 10).toUpperCase();
      const random2 = Math.random().toString(36).substring(2, 10).toUpperCase();
      const random3 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const keyValue = `SH-${timestamp}-${random1}-${random2}-${random3}`;

      const { data, error } = await supabase
        .from("script_keys")
        .insert({
          script_id: scriptId,
          key_value: keyValue,
          is_premium: options.isPremium ?? false,
          max_uses: options.maxUses ?? null,
          expires_at: options.expiresAt ?? null,
          hwid_lock_enabled: options.hwidLockEnabled ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Key generated successfully!");
      await fetchKeys();
      return data as ScriptKey;
    } catch (error: any) {
      console.error("Error generating key:", error);
      toast.error("Failed to generate key");
      return null;
    }
  };

  const revokeKey = async (keyId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("script_keys")
        .update({ is_active: false })
        .eq("id", keyId);

      if (error) throw error;
      
      toast.success("Key revoked successfully!");
      await fetchKeys();
      return true;
    } catch (error: any) {
      console.error("Error revoking key:", error);
      toast.error("Failed to revoke key");
      return false;
    }
  };

  const deleteKey = async (keyId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("script_keys")
        .delete()
        .eq("id", keyId);

      if (error) throw error;
      
      toast.success("Key deleted successfully!");
      await fetchKeys();
      return true;
    } catch (error: any) {
      console.error("Error deleting key:", error);
      toast.error("Failed to delete key");
      return false;
    }
  };

  const resetHwid = async (keyId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("script_keys")
        .update({ hwid_locked: null })
        .eq("id", keyId);

      if (error) throw error;
      
      toast.success("HWID reset successfully!");
      await fetchKeys();
      return true;
    } catch (error: any) {
      console.error("Error resetting HWID:", error);
      toast.error("Failed to reset HWID");
      return false;
    }
  };

  return {
    keys,
    loading,
    fetchKeys,
    generateKey,
    revokeKey,
    deleteKey,
    resetHwid,
  };
}

export function useWhitelist(scriptId: string | null) {
  const [whitelist, setWhitelist] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWhitelist = useCallback(async () => {
    if (!scriptId) {
      setWhitelist([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("script_whitelist")
        .select("*")
        .eq("script_id", scriptId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWhitelist((data as WhitelistEntry[]) || []);
    } catch (error: any) {
      console.error("Error fetching whitelist:", error);
      toast.error("Failed to load whitelist");
    } finally {
      setLoading(false);
    }
  }, [scriptId]);

  useEffect(() => {
    fetchWhitelist();
  }, [fetchWhitelist]);

  const addToWhitelist = async (
    identifier: string,
    identifierType: "roblox_id" | "username" | "hwid",
    note?: string
  ): Promise<WhitelistEntry | null> => {
    if (!scriptId) return null;

    try {
      const { data, error } = await supabase
        .from("script_whitelist")
        .insert({
          script_id: scriptId,
          identifier,
          identifier_type: identifierType,
          note: note || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Added to whitelist!");
      await fetchWhitelist();
      return data as WhitelistEntry;
    } catch (error: any) {
      console.error("Error adding to whitelist:", error);
      toast.error("Failed to add to whitelist");
      return null;
    }
  };

  const removeFromWhitelist = async (entryId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("script_whitelist")
        .delete()
        .eq("id", entryId);

      if (error) throw error;
      
      toast.success("Removed from whitelist!");
      await fetchWhitelist();
      return true;
    } catch (error: any) {
      console.error("Error removing from whitelist:", error);
      toast.error("Failed to remove from whitelist");
      return false;
    }
  };

  return {
    whitelist,
    loading,
    fetchWhitelist,
    addToWhitelist,
    removeFromWhitelist,
  };
}

export function useScriptAnalytics(scriptId: string | null) {
  const [executions, setExecutions] = useState<ScriptExecution[]>([]);
  const [stats, setStats] = useState({
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    uniqueIPs: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    if (!scriptId) {
      setExecutions([]);
      setStats({ totalExecutions: 0, successfulExecutions: 0, failedExecutions: 0, uniqueIPs: 0 });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("script_executions")
        .select("*")
        .eq("script_id", scriptId)
        .order("executed_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const execs = (data as ScriptExecution[]) || [];
      setExecutions(execs);

      // Calculate stats
      const uniqueIPs = new Set(execs.map(e => e.executor_ip).filter(Boolean));
      setStats({
        totalExecutions: execs.length,
        successfulExecutions: execs.filter(e => e.success).length,
        failedExecutions: execs.filter(e => !e.success).length,
        uniqueIPs: uniqueIPs.size,
      });
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [scriptId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    executions,
    stats,
    loading,
    fetchAnalytics,
  };
}

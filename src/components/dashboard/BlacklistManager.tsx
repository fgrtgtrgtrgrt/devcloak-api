import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ban, Trash2, Plus, X, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface BlacklistEntry {
  id: string;
  identifier: string;
  identifier_type: "roblox_id" | "username" | "hwid";
  reason: string | null;
  is_global: boolean;
  script_id: string | null;
  created_at: string;
}

interface BlacklistManagerProps {
  scriptId: string;
}

export function BlacklistManager({ scriptId }: BlacklistManagerProps) {
  const { user } = useAuth();
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    identifier: "",
    identifierType: "hwid" as "roblox_id" | "username" | "hwid",
    reason: "",
    isGlobal: false,
  });

  const fetchBlacklist = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_blacklist")
        .select("*")
        .eq("created_by", user.id)
        .or(`script_id.eq.${scriptId},is_global.eq.true`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlacklist((data as BlacklistEntry[]) || []);
    } catch (error) {
      console.error("Error fetching blacklist:", error);
      toast.error("Failed to load blacklist");
    } finally {
      setLoading(false);
    }
  }, [scriptId, user]);

  useEffect(() => {
    fetchBlacklist();
  }, [fetchBlacklist]);

  const handleAdd = async () => {
    if (!newEntry.identifier.trim() || !user) return;

    setAdding(true);
    try {
      const { error } = await supabase.from("user_blacklist").insert({
        identifier: newEntry.identifier.trim(),
        identifier_type: newEntry.identifierType,
        reason: newEntry.reason || null,
        is_global: newEntry.isGlobal,
        script_id: newEntry.isGlobal ? null : scriptId,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Added to blacklist!");
      setShowAdd(false);
      setNewEntry({ identifier: "", identifierType: "hwid", reason: "", isGlobal: false });
      fetchBlacklist();
    } catch (error) {
      console.error("Error adding to blacklist:", error);
      toast.error("Failed to add to blacklist");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from("user_blacklist")
        .delete()
        .eq("id", entryId);

      if (error) throw error;

      toast.success("Removed from blacklist!");
      fetchBlacklist();
    } catch (error) {
      console.error("Error removing from blacklist:", error);
      toast.error("Failed to remove from blacklist");
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Ban className="w-5 h-5 text-destructive" />
            Blacklist ({blacklist.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Block users from accessing your scripts
          </p>
        </div>
        <Button size="sm" variant="destructive" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" />
          Add to Blacklist
        </Button>
      </div>

      {showAdd && (
        <div className="mb-4 p-4 border border-destructive/30 rounded-lg space-y-4 bg-destructive/5">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Block User
            </h4>
            <Button variant="ghost" size="icon" onClick={() => setShowAdd(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newEntry.identifierType}
                onValueChange={(value: "roblox_id" | "username" | "hwid") =>
                  setNewEntry({ ...newEntry, identifierType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hwid">HWID</SelectItem>
                  <SelectItem value="roblox_id">Roblox ID</SelectItem>
                  <SelectItem value="username">Username</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Identifier</Label>
              <Input
                placeholder={
                  newEntry.identifierType === "hwid"
                    ? "HWID-STRING"
                    : newEntry.identifierType === "roblox_id"
                    ? "12345678"
                    : "RobloxUsername"
                }
                value={newEntry.identifier}
                onChange={(e) => setNewEntry({ ...newEntry, identifier: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Input
              placeholder="e.g., Leaked script, Cheating, etc."
              value={newEntry.reason}
              onChange={(e) => setNewEntry({ ...newEntry, reason: e.target.value })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="globalBan"
              checked={newEntry.isGlobal}
              onChange={(e) => setNewEntry({ ...newEntry, isGlobal: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="globalBan" className="text-sm cursor-pointer">
              Global ban (applies to all your scripts)
            </Label>
          </div>

          <Button
            onClick={handleAdd}
            disabled={adding || !newEntry.identifier.trim()}
            variant="destructive"
            className="w-full"
          >
            {adding ? "Adding..." : "Block User"}
          </Button>
        </div>
      )}

      {blacklist.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          No users blacklisted. Click "Add to Blacklist" to block users.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Identifier</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blacklist.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive capitalize">
                      {entry.identifier_type.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.identifier.substring(0, 20)}
                    {entry.identifier.length > 20 && "..."}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.reason || "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        entry.is_global
                          ? "bg-amber-500/20 text-amber-500"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {entry.is_global ? "Global" : "This Script"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleRemove(entry.id)}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

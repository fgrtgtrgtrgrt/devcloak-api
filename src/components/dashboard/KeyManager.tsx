import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, Copy, Trash2, RotateCcw, Plus, X } from "lucide-react";
import { ScriptKey, useScriptKeys } from "@/hooks/useScripts";
import { toast } from "sonner";

interface KeyManagerProps {
  scriptId: string;
}

export function KeyManager({ scriptId }: KeyManagerProps) {
  const { keys, loading, generateKey, revokeKey, deleteKey, resetHwid } = useScriptKeys(scriptId);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyOptions, setNewKeyOptions] = useState({
    isPremium: false,
    maxUses: "",
    expiresInDays: "",
    hwidLockEnabled: false,
  });
  const [generating, setGenerating] = useState(false);

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const expiresAt = newKeyOptions.expiresInDays
        ? new Date(Date.now() + parseInt(newKeyOptions.expiresInDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      await generateKey({
        isPremium: newKeyOptions.isPremium,
        maxUses: newKeyOptions.maxUses ? parseInt(newKeyOptions.maxUses) : null,
        expiresAt,
        hwidLockEnabled: newKeyOptions.hwidLockEnabled,
      });

      setShowNewKey(false);
      setNewKeyOptions({
        isPremium: false,
        maxUses: "",
        expiresInDays: "",
        hwidLockEnabled: false,
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Key copied to clipboard!");
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
            <Key className="w-5 h-5 text-primary" />
            Keys ({keys.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Keys generated here will only work for this script
          </p>
        </div>
        <Button size="sm" onClick={() => setShowNewKey(true)}>
          <Plus className="w-4 h-4" />
          Generate Key
        </Button>
      </div>

      {showNewKey && (
        <div className="mb-4 p-4 border border-border rounded-lg space-y-4 bg-secondary/30">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">New Key Options</h4>
            <Button variant="ghost" size="icon" onClick={() => setShowNewKey(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses (blank = unlimited)</Label>
              <Input
                id="maxUses"
                type="number"
                placeholder="Unlimited"
                value={newKeyOptions.maxUses}
                onChange={(e) => setNewKeyOptions({ ...newKeyOptions, maxUses: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresIn">Expires in (days, blank = never)</Label>
              <Input
                id="expiresIn"
                type="number"
                placeholder="Never"
                value={newKeyOptions.expiresInDays}
                onChange={(e) => setNewKeyOptions({ ...newKeyOptions, expiresInDays: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="premium"
                checked={newKeyOptions.isPremium}
                onCheckedChange={(checked) => setNewKeyOptions({ ...newKeyOptions, isPremium: checked })}
              />
              <Label htmlFor="premium">Premium Key</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="hwidLock"
                checked={newKeyOptions.hwidLockEnabled}
                onCheckedChange={(checked) => setNewKeyOptions({ ...newKeyOptions, hwidLockEnabled: checked })}
              />
              <Label htmlFor="hwidLock">HWID Lock</Label>
            </div>
          </div>

          <Button onClick={handleGenerateKey} disabled={generating} className="w-full">
            {generating ? "Generating..." : "Generate Key"}
          </Button>
        </div>
      )}

      {keys.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          No keys generated yet. Click "Generate Key" to create one.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>HWID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="max-w-[180px] truncate">{key.key_value}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => copyKey(key.key_value)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        key.is_active
                          ? "bg-success/20 text-success"
                          : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {key.is_active ? "Active" : "Revoked"}
                    </span>
                    {key.is_premium && (
                      <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                        Premium
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {key.current_uses}/{key.max_uses ?? "∞"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {key.expires_at
                      ? new Date(key.expires_at).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {key.hwid_lock_enabled ? (
                      key.hwid_locked ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-success">Locked</span>
                          <span className="font-mono text-[10px] text-muted-foreground max-w-[120px] truncate" title={key.hwid_locked}>
                            {key.hwid_locked}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-500">Pending</span>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">Off</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {key.hwid_locked && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => resetHwid(key.id)}
                          title="Reset HWID"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                      )}
                      {key.is_active && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => revokeKey(key.id)}
                          title="Revoke key"
                        >
                          <X className="w-3 h-3 text-amber-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => deleteKey(key.id)}
                        title="Delete key"
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
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

import { useState } from "react";
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
import { Users, Trash2, Plus, X } from "lucide-react";
import { useWhitelist } from "@/hooks/useScripts";

interface WhitelistManagerProps {
  scriptId: string;
}

export function WhitelistManager({ scriptId }: WhitelistManagerProps) {
  const { whitelist, loading, addToWhitelist, removeFromWhitelist } = useWhitelist(scriptId);
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({
    identifier: "",
    identifierType: "roblox_id" as "roblox_id" | "username" | "hwid",
    note: "",
  });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newEntry.identifier.trim()) return;
    
    setAdding(true);
    try {
      await addToWhitelist(
        newEntry.identifier.trim(),
        newEntry.identifierType,
        newEntry.note || undefined
      );
      setShowAdd(false);
      setNewEntry({ identifier: "", identifierType: "roblox_id", note: "" });
    } finally {
      setAdding(false);
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
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Whitelist ({whitelist.length})
        </h3>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </div>

      {showAdd && (
        <div className="mb-4 p-4 border border-border rounded-lg space-y-4 bg-secondary/30">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Add to Whitelist</h4>
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
                  <SelectItem value="roblox_id">Roblox ID</SelectItem>
                  <SelectItem value="username">Username</SelectItem>
                  <SelectItem value="hwid">HWID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Identifier</Label>
              <Input
                placeholder={
                  newEntry.identifierType === "roblox_id"
                    ? "12345678"
                    : newEntry.identifierType === "username"
                    ? "RobloxUsername"
                    : "HWID-STRING"
                }
                value={newEntry.identifier}
                onChange={(e) => setNewEntry({ ...newEntry, identifier: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Input
              placeholder="e.g., Beta tester, Friend, etc."
              value={newEntry.note}
              onChange={(e) => setNewEntry({ ...newEntry, note: e.target.value })}
            />
          </div>

          <Button onClick={handleAdd} disabled={adding || !newEntry.identifier.trim()} className="w-full">
            {adding ? "Adding..." : "Add to Whitelist"}
          </Button>
        </div>
      )}

      {whitelist.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          No whitelist entries yet. Click "Add Entry" to whitelist users.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Identifier</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {whitelist.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary capitalize">
                      {entry.identifier_type.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{entry.identifier}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.note || "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeFromWhitelist(entry.id)}
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

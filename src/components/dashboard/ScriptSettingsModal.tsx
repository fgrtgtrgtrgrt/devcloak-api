import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Settings, Shield, Code } from "lucide-react";
import { Script } from "@/hooks/useScripts";

interface ScriptSettingsModalProps {
  script: Script;
  onClose: () => void;
  onSave: (updates: Partial<Script>) => Promise<boolean>;
}

export function ScriptSettingsModal({ script, onClose, onSave }: ScriptSettingsModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: script.name,
    description: script.description || "",
    protection_mode: script.protection_mode,
    anti_tamper: script.anti_tamper,
    anti_dump: script.anti_dump,
    anti_hook: script.anti_hook,
    original_code: script.original_code,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await onSave({
        name: formData.name,
        protection_mode: formData.protection_mode,
        anti_tamper: formData.anti_tamper,
        anti_dump: formData.anti_dump,
        anti_hook: formData.anti_hook,
        original_code: formData.original_code,
      });
      if (success) {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Script Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Code className="w-4 h-4" />
              Basic Information
            </h4>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Script Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Script"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this script do?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protection">Protection Mode</Label>
                <Select
                  value={formData.protection_mode}
                  onValueChange={(value: "key" | "whitelist" | "keyless") =>
                    setFormData({ ...formData, protection_mode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyless">Keyless (Public)</SelectItem>
                    <SelectItem value="key">Key System</SelectItem>
                    <SelectItem value="whitelist">Whitelist Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Security Options */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Options
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div>
                  <p className="font-medium text-sm">Anti-Tamper</p>
                  <p className="text-xs text-muted-foreground">Prevents code modification</p>
                </div>
                <Switch
                  checked={formData.anti_tamper}
                  onCheckedChange={(checked) => setFormData({ ...formData, anti_tamper: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div>
                  <p className="font-medium text-sm">Anti-Dump</p>
                  <p className="text-xs text-muted-foreground">Protects against memory dumps</p>
                </div>
                <Switch
                  checked={formData.anti_dump}
                  onCheckedChange={(checked) => setFormData({ ...formData, anti_dump: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50">
                <div>
                  <p className="font-medium text-sm">Anti-Hook</p>
                  <p className="text-xs text-muted-foreground">Detects function hooks</p>
                </div>
                <Switch
                  checked={formData.anti_hook}
                  onCheckedChange={(checked) => setFormData({ ...formData, anti_hook: checked })}
                />
              </div>
            </div>
          </div>

          {/* Script Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Script Code</Label>
            <Textarea
              id="code"
              value={formData.original_code}
              onChange={(e) => setFormData({ ...formData, original_code: e.target.value })}
              className="font-mono text-sm min-h-[200px]"
              placeholder="-- Your Lua code here"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

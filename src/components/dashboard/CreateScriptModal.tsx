import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Key, Lock, Unlock, Users, X } from "lucide-react";

interface CreateScriptModalProps {
  onClose: () => void;
  onCreate: (
    name: string,
    code: string,
    mode: "key" | "whitelist" | "keyless",
    options: { antiTamper: boolean; antiDump: boolean; antiHook: boolean }
  ) => Promise<void>;
}

export function CreateScriptModal({ onClose, onCreate }: CreateScriptModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [mode, setMode] = useState<"key" | "whitelist" | "keyless">("keyless");
  const [antiTamper, setAntiTamper] = useState(true);
  const [antiDump, setAntiDump] = useState(true);
  const [antiHook, setAntiHook] = useState(true);
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    setCreating(true);
    try {
      await onCreate(name.trim(), code.trim(), mode, { antiTamper, antiDump, antiHook });
      onClose();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card p-8 w-full max-w-lg animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Create New Script</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="scriptName">Script Name</Label>
            <Input
              id="scriptName"
              placeholder="My Awesome Script"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scriptCode">Lua Code</Label>
            <Textarea
              id="scriptCode"
              placeholder="-- Your Lua code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-secondary/50 min-h-[200px] font-mono text-sm"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Protection Mode</Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "key" as const, icon: Key, label: "Key System" },
                { id: "whitelist" as const, icon: Users, label: "Whitelist" },
                { id: "keyless" as const, icon: Unlock, label: "Keyless" },
              ].map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMode(option.id)}
                  className={`p-4 rounded-lg border transition-all text-center group ${
                    mode === option.id
                      ? "border-primary bg-primary/10"
                      : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  <option.icon
                    className={`w-5 h-5 mx-auto mb-2 ${
                      mode === option.id ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      mode === option.id ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Protection Options</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Anti-Tamper</div>
                  <div className="text-xs text-muted-foreground">Detect code modifications</div>
                </div>
                <Switch checked={antiTamper} onCheckedChange={setAntiTamper} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Anti-Dump</div>
                  <div className="text-xs text-muted-foreground">Prevent source extraction</div>
                </div>
                <Switch checked={antiDump} onCheckedChange={setAntiDump} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Anti-Hook</div>
                  <div className="text-xs text-muted-foreground">Detect environment tampering</div>
                </div>
                <Switch checked={antiHook} onCheckedChange={setAntiHook} />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" className="flex-1" disabled={creating}>
              <Lock className="w-4 h-4" />
              {creating ? "Creating..." : "Create & Obfuscate"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

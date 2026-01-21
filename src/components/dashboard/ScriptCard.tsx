import { Button } from "@/components/ui/button";
import { Code, Copy, Key, Settings, Trash2, Unlock, Users, Pause, Play } from "lucide-react";
import { Script } from "@/hooks/useScripts";
import { toast } from "sonner";

interface ScriptCardProps {
  script: Script;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onSettings: (script: Script) => void;
}

export function ScriptCard({
  script,
  isSelected,
  onSelect,
  onDelete,
  onToggleActive,
  onSettings,
}: ScriptCardProps) {
  const loaderUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/loader/${script.id}`;

  const copyLoader = (e: React.MouseEvent) => {
    e.stopPropagation();
    const keyPart = script.protection_mode === "key" 
      ? 'getgenv().SCRIPT_KEY = "YOUR_KEY_HERE"'
      : 'getgenv().SCRIPT_KEY = "KEYLESS"';
    const loader = `${keyPart}
loadstring(game:HttpGet("${loaderUrl}"))()`;
    navigator.clipboard.writeText(loader);
    toast.success("Loader copied to clipboard!");
  };

  return (
    <div
      className={`glass-card p-6 cursor-pointer transition-all hover:border-primary/50 ${
        isSelected ? "border-primary" : ""
      }`}
      onClick={() => onSelect(script.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Code className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{script.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  script.is_active
                    ? "bg-success/20 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {script.is_active ? "active" : "paused"}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {script.protection_mode === "key" && (
                  <>
                    <Key className="w-3 h-3" /> Key System
                  </>
                )}
                {script.protection_mode === "whitelist" && (
                  <>
                    <Users className="w-3 h-3" /> Whitelist
                  </>
                )}
                {script.protection_mode === "keyless" && (
                  <>
                    <Unlock className="w-3 h-3" /> Keyless
                  </>
                )}
              </span>
              {script.is_premium && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500">
                  Premium
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={copyLoader}
            title="Copy loader"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(script.id, !script.is_active);
            }}
            title={script.is_active ? "Pause script" : "Activate script"}
          >
            {script.is_active ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onSettings(script);
            }}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(script.id);
            }}
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
        <span>v{script.version}</span>
        <span>Created {new Date(script.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

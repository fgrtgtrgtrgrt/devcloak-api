import { Button } from "@/components/ui/button";
import { Copy, Key, Plus, Zap } from "lucide-react";
import { Script } from "@/hooks/useScripts";
import { toast } from "sonner";

interface QuickActionsProps {
  selectedScript: Script | null;
  onNewScript: () => void;
  onGenerateKey?: () => void;
}

export function QuickActions({ selectedScript, onNewScript, onGenerateKey }: QuickActionsProps) {
  const copyLoader = () => {
    if (!selectedScript) {
      toast.error("Select a script first");
      return;
    }
    
    const loaderUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/loader/${selectedScript.id}`;
    const keyPart = selectedScript.protection_mode === "key" 
      ? 'getgenv().SCRIPT_KEY = "YOUR_KEY_HERE"'
      : 'getgenv().SCRIPT_KEY = "KEYLESS"';
    const loader = `${keyPart}
loadstring(game:HttpGet("${loaderUrl}"))()`;
    navigator.clipboard.writeText(loader);
    toast.success("Loader copied to clipboard!");
  };

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
        Quick Actions
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNewScript}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Script
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={copyLoader}
          disabled={!selectedScript}
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy Loader
        </Button>

        {selectedScript?.protection_mode === "key" && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onGenerateKey}
            className="gap-2"
          >
            <Key className="w-4 h-4" />
            Generate Key
          </Button>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-accent border-accent/30 hover:bg-accent/10"
        >
          <Zap className="w-4 h-4" />
          Bulk Actions
        </Button>
      </div>
    </div>
  );
}

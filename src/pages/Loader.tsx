import { useParams } from "react-router-dom";
import { Shield, AlertTriangle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Loader() {
  const { scriptId } = useParams<{ scriptId: string }>();
  
  // raw=1 forces Lua output even when the executor sends a browser-like user-agent.
  const loaderUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/loader/${scriptId}?raw=1`;
  
  const copyLoader = () => {
    // Works for all modes:
    // - keyless/whitelist ignore &key=
    // - key mode requires &key=...
    const loader = `local key = (getgenv and getgenv().SCRIPT_KEY) or "YOUR_KEY_HERE"
loadstring(game:HttpGet("${loaderUrl}&key=" .. tostring(key)))()`;
    navigator.clipboard.writeText(loader);
    toast.success("Loader copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary) / 0.03) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary) / 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="relative z-10 text-center max-w-lg">
        {/* Shield icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-2xl shadow-primary/30">
          <Shield className="w-10 h-10 text-white" />
        </div>
        
        {/* Subtitle */}
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-2">
          Protected Script
        </p>
        
        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white to-primary bg-clip-text text-transparent mb-6">
          ACCESS DENIED
        </h1>
        
        {/* Description */}
        <div className="glass-card p-6 mb-6">
          <p className="text-muted-foreground mb-4">
            This script is protected by ScriptHub's enterprise-grade security system.
          </p>
          <p className="text-muted-foreground mb-4">
            Direct browser access is prohibited. This endpoint is designed for <strong className="text-foreground">Roblox executor use only</strong>.
          </p>
          
          {scriptId && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3">
                To use this script, copy the loader below:
              </p>
              <Button onClick={copyLoader} className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy Loader Code
              </Button>
            </div>
          )}
        </div>
        
        {/* Warning */}
        <div className="inline-flex items-center gap-2 bg-destructive/20 border border-destructive/30 text-destructive-foreground px-4 py-2 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4" />
          Unauthorized access attempts are logged
        </div>
      </div>
    </div>
  );
}

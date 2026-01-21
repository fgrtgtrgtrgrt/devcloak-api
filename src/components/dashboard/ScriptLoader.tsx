import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Script } from "@/hooks/useScripts";
import { toast } from "sonner";

interface ScriptLoaderProps {
  script: Script;
}

export function ScriptLoader({ script }: ScriptLoaderProps) {
  // Use Supabase edge function URL for actual loader (Roblox needs this)
  const baseLoaderUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/loader/${script.id}`;
  // Display friendly URL for users to share
  const displayUrl = `${window.location.origin}/loader/${script.id}`;

  const copyLoader = () => {
    let loader: string;
    
    if (script.protection_mode === "key") {
      // For key-protected scripts, key is passed in URL - HWID is grabbed inside the script
      loader = `local key = "YOUR_KEY_HERE" -- Replace with your actual key

loadstring(game:HttpGet("${baseLoaderUrl}?key=" .. key))()`;
    } else {
      // For whitelist and keyless - HWID detection is embedded in the script itself
      loader = `loadstring(game:HttpGet("${baseLoaderUrl}"))()`;
    }
    
    navigator.clipboard.writeText(loader);
    toast.success("Loader copied to clipboard!");
  };

  const getLoaderPreview = () => {
    if (script.protection_mode === "key") {
      return (
        <>
          <span className="text-muted-foreground">local</span>{" "}
          <span className="text-primary">key</span>
          <span className="text-foreground"> = </span>
          <span className="text-success">"YOUR_KEY_HERE"</span>
          <br />
          <span className="text-accent">loadstring</span>(
          <span className="text-accent">game</span>:
          <span className="text-accent">HttpGet</span>(
          <span className="text-success text-[10px]">"...?key="</span>
          .. key))()
        </>
      );
    } else {
      return (
        <>
          <span className="text-accent">loadstring</span>(
          <span className="text-accent">game</span>:
          <span className="text-accent">HttpGet</span>(
          <span className="text-success text-[10px] break-all">
            "..."
          </span>
          ))()
        </>
      );
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold text-foreground mb-2">Script Loader</h3>
      <p className="text-xs text-muted-foreground mb-4">
        {script.protection_mode === "key" && "Replace YOUR_KEY_HERE with a generated key"}
        {script.protection_mode === "whitelist" && "Your HWID must be whitelisted to use this script"}
        {script.protection_mode === "keyless" && "No key required - anyone can use this script"}
      </p>
      <div className="code-block text-xs overflow-x-auto">
        <code>{getLoaderPreview()}</code>
      </div>
      <p className="text-xs text-muted-foreground mt-3 mb-2">
        Share this link: <a href={displayUrl} target="_blank" className="text-primary hover:underline">{displayUrl}</a>
      </p>
      <Button variant="outline" className="w-full mt-2" onClick={copyLoader}>
        <Copy className="w-4 h-4" />
        Copy Loader
      </Button>
    </div>
  );
}

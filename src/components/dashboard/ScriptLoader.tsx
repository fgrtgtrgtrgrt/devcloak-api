import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Script } from "@/hooks/useScripts";
import { toast } from "sonner";

interface ScriptLoaderProps {
  script: Script;
}

export function ScriptLoader({ script }: ScriptLoaderProps) {
  const loaderUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/loader/${script.id}`;

  const copyLoader = () => {
    const keyPart = script.protection_mode === "key" 
      ? 'getgenv().SCRIPT_KEY = "YOUR_KEY_HERE"'
      : 'getgenv().SCRIPT_KEY = "KEYLESS"';
    const loader = `${keyPart}
loadstring(game:HttpGet("${loaderUrl}"))()`;
    navigator.clipboard.writeText(loader);
    toast.success("Loader copied to clipboard!");
  };

  return (
    <div className="glass-card p-6">
      <h3 className="font-semibold text-foreground mb-4">Script Loader</h3>
      <div className="code-block text-xs overflow-x-auto">
        <code>
          {script.protection_mode === "key" ? (
            <>
              <span className="text-accent">getgenv</span>()
              <span className="text-foreground">.</span>
              <span className="text-primary">SCRIPT_KEY</span>
              <span className="text-foreground"> = </span>
              <span className="text-success">"YOUR_KEY"</span>
            </>
          ) : (
            <>
              <span className="text-accent">getgenv</span>()
              <span className="text-foreground">.</span>
              <span className="text-primary">SCRIPT_KEY</span>
              <span className="text-foreground"> = </span>
              <span className="text-success">"KEYLESS"</span>
            </>
          )}
          <br />
          <span className="text-accent">loadstring</span>(
          <span className="text-accent">game</span>:
          <span className="text-accent">HttpGet</span>(
          <span className="text-success text-[10px] break-all">
            "{loaderUrl}"
          </span>
          ))()
        </code>
      </div>
      <Button variant="outline" className="w-full mt-4" onClick={copyLoader}>
        <Copy className="w-4 h-4" />
        Copy Loader
      </Button>
    </div>
  );
}

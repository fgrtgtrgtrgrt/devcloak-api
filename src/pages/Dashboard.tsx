import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Code,
  Key,
  Users,
  Copy,
  Trash2,
  Settings,
  Eye,
  Lock,
  Unlock,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

// Mock data for demo
const mockScripts = [
  {
    id: "1",
    name: "Auto Farm Script",
    status: "active",
    keys: 45,
    executions: 1234,
    mode: "key",
  },
  {
    id: "2",
    name: "ESP Hack v2",
    status: "active",
    keys: 12,
    executions: 567,
    mode: "whitelist",
  },
  {
    id: "3",
    name: "Speed Modifier",
    status: "paused",
    keys: 0,
    executions: 89,
    mode: "keyless",
  },
];

const Dashboard = () => {
  const [scripts] = useState(mockScripts);
  const [showNewScript, setShowNewScript] = useState(false);
  const [selectedScript, setSelectedScript] = useState<string | null>(null);

  const copyLoader = (scriptId: string) => {
    const loader = `getgenv().SCRIPT_KEY = "YOUR_KEY_HERE"
loadstring(game:HttpGet("https://api.scripthub.dev/v1/load/${scriptId}"))()`;
    navigator.clipboard.writeText(loader);
    toast.success("Loader copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage your scripts, keys, and whitelists
              </p>
            </div>
            <Button
              variant="hero"
              onClick={() => setShowNewScript(true)}
              className="w-full md:w-auto"
            >
              <Plus className="w-4 h-4" />
              New Script
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Scripts", value: scripts.length, icon: Code },
              { label: "Active Keys", value: "57", icon: Key },
              { label: "Whitelisted Users", value: "124", icon: Users },
              { label: "Total Executions", value: "1,890", icon: CheckCircle },
            ].map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="flex items-center justify-between">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Scripts List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Your Scripts
              </h2>
              {scripts.map((script) => (
                <div
                  key={script.id}
                  className={`glass-card p-6 cursor-pointer transition-all hover:border-primary/50 ${
                    selectedScript === script.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedScript(script.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
                        <Code className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {script.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              script.status === "active"
                                ? "bg-success/20 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {script.status}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            {script.mode === "key" && (
                              <>
                                <Key className="w-3 h-3" /> Key System
                              </>
                            )}
                            {script.mode === "whitelist" && (
                              <>
                                <Users className="w-3 h-3" /> Whitelist
                              </>
                            )}
                            {script.mode === "keyless" && (
                              <>
                                <Unlock className="w-3 h-3" /> Keyless
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyLoader(script.id);
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
                    <span>{script.keys} keys</span>
                    <span>{script.executions.toLocaleString()} executions</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions / Selected Script Details */}
            <div className="space-y-6">
              {selectedScript ? (
                <div className="glass-card p-6">
                  <h3 className="font-semibold text-foreground mb-4">
                    Script Loader
                  </h3>
                  <div className="code-block text-xs overflow-x-auto">
                    <code>
                      <span className="text-accent">getgenv</span>()
                      <span className="text-foreground">.</span>
                      <span className="text-primary">SCRIPT_KEY</span>
                      <span className="text-foreground"> = </span>
                      <span className="text-success">"KEY"</span>
                      <br />
                      <span className="text-accent">loadstring</span>(
                      <span className="text-accent">game</span>:
                      <span className="text-accent">HttpGet</span>(
                      <span className="text-success">
                        "https://api.scripthub.dev/v1/load/{selectedScript}"
                      </span>
                      ))()
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => copyLoader(selectedScript)}
                  >
                    <Copy className="w-4 h-4" />
                    Copy Loader
                  </Button>
                </div>
              ) : null}

              <div className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Key className="w-4 h-4" />
                    Generate Keys
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4" />
                    Manage Whitelist
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* New Script Modal */}
      {showNewScript && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-card p-8 w-full max-w-lg animate-fade-in">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Create New Script
            </h2>
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="scriptName">Script Name</Label>
                <Input
                  id="scriptName"
                  placeholder="My Awesome Script"
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scriptCode">Lua Code</Label>
                <Textarea
                  id="scriptCode"
                  placeholder="-- Your Lua code here..."
                  className="bg-secondary/50 min-h-[200px] font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Protection Mode</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "key", icon: Key, label: "Key System" },
                    { id: "whitelist", icon: Users, label: "Whitelist" },
                    { id: "keyless", icon: Unlock, label: "Keyless" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all text-center group"
                    >
                      <mode.icon className="w-5 h-5 mx-auto mb-2 text-muted-foreground group-hover:text-primary" />
                      <span className="text-xs text-muted-foreground group-hover:text-foreground">
                        {mode.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewScript(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="hero" className="flex-1">
                  <Lock className="w-4 h-4" />
                  Create & Obfuscate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;

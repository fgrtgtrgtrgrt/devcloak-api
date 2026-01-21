import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Plus, Code, Key, Users, CheckCircle } from "lucide-react";
import { useScripts, Script } from "@/hooks/useScripts";
import { ScriptCard } from "@/components/dashboard/ScriptCard";
import { ScriptLoader } from "@/components/dashboard/ScriptLoader";
import { KeyManager } from "@/components/dashboard/KeyManager";
import { WhitelistManager } from "@/components/dashboard/WhitelistManager";
import { BlacklistManager } from "@/components/dashboard/BlacklistManager";
import { ExecutionLogs } from "@/components/dashboard/ExecutionLogs";
import { CreateScriptModal } from "@/components/dashboard/CreateScriptModal";
import { ScriptSettingsModal } from "@/components/dashboard/ScriptSettingsModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { scripts, loading, createScript, updateScript, deleteScript } = useScripts();
  const [showNewScript, setShowNewScript] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [settingsScript, setSettingsScript] = useState<Script | null>(null);

  const selectedScript = scripts.find((s) => s.id === selectedScriptId);

  const handleCreate = async (
    name: string,
    code: string,
    mode: "key" | "whitelist" | "keyless",
    options: { antiTamper: boolean; antiDump: boolean; antiHook: boolean }
  ) => {
    const script = await createScript(name, code, mode, options);
    if (script) {
      setSelectedScriptId(script.id);
    }
  };

  const handleSettings = (script: Script) => {
    setSettingsScript(script);
  };

  const handleSaveSettings = async (updates: Partial<Script>) => {
    if (!settingsScript) return false;
    return await updateScript(settingsScript.id, updates);
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
            <Button variant="hero" onClick={() => setShowNewScript(true)} className="w-full md:w-auto">
              <Plus className="w-4 h-4" />
              New Script
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Scripts", value: scripts.length, icon: Code },
              { label: "Active Scripts", value: scripts.filter(s => s.is_active).length, icon: Key },
              { label: "Key Protected", value: scripts.filter(s => s.protection_mode === "key").length, icon: Users },
              { label: "Keyless", value: scripts.filter(s => s.protection_mode === "keyless").length, icon: CheckCircle },
            ].map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="flex items-center justify-between">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading scripts...</p>
            </div>
          ) : scripts.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No scripts yet</h2>
              <p className="text-muted-foreground mb-6">Create your first protected script to get started.</p>
              <Button variant="hero" onClick={() => setShowNewScript(true)}>
                <Plus className="w-4 h-4" />
                Create Script
              </Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Scripts List */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="text-xl font-semibold text-foreground mb-4">Your Scripts</h2>
                {scripts.map((script) => (
                  <ScriptCard
                    key={script.id}
                    script={script}
                    isSelected={selectedScriptId === script.id}
                    onSelect={setSelectedScriptId}
                    onDelete={deleteScript}
                    onToggleActive={(id, isActive) => updateScript(id, { is_active: isActive })}
                    onSettings={handleSettings}
                  />
                ))}
              </div>

              {/* Script Details */}
              <div className="lg:col-span-2 space-y-6">
                {selectedScript ? (
                  <>
                    <ScriptLoader script={selectedScript} />
                    
                    <Tabs defaultValue="keys" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="keys">Keys</TabsTrigger>
                        <TabsTrigger value="whitelist">Whitelist</TabsTrigger>
                        <TabsTrigger value="blacklist">Blacklist</TabsTrigger>
                        <TabsTrigger value="logs">Logs</TabsTrigger>
                      </TabsList>
                      <TabsContent value="keys" className="mt-4">
                        <KeyManager scriptId={selectedScript.id} />
                      </TabsContent>
                      <TabsContent value="whitelist" className="mt-4">
                        <WhitelistManager scriptId={selectedScript.id} />
                      </TabsContent>
                      <TabsContent value="blacklist" className="mt-4">
                        <BlacklistManager scriptId={selectedScript.id} />
                      </TabsContent>
                      <TabsContent value="logs" className="mt-4">
                        <ExecutionLogs scriptId={selectedScript.id} />
                      </TabsContent>
                    </Tabs>
                  </>
                ) : (
                  <div className="glass-card p-12 text-center">
                    <Code className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a script to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {showNewScript && (
        <CreateScriptModal onClose={() => setShowNewScript(false)} onCreate={handleCreate} />
      )}

      {settingsScript && (
        <ScriptSettingsModal
          script={settingsScript}
          onClose={() => setSettingsScript(null)}
          onSave={handleSaveSettings}
        />
      )}

      <Footer />
    </div>
  );
};

export default Dashboard;

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Code, Key, Users, Shield, Zap, Lock } from "lucide-react";

const Docs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="max-w-3xl mb-12">
            <h1 className="text-4xl font-bold mb-4">
              <span className="gradient-text">Documentation</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Learn how to integrate ScriptHub into your Roblox projects.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="glass-card p-4 sticky top-24">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                  Getting Started
                </h3>
                <ul className="space-y-2">
                  {[
                    "Quick Start",
                    "Authentication",
                    "Creating Scripts",
                    "Key System",
                    "Whitelist",
                    "API Reference",
                  ].map((item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase().replace(" ", "-")}`}
                        className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-12">
              {/* Quick Start */}
              <section id="quick-start">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  Quick Start
                </h2>
                <div className="glass-card p-6 space-y-4">
                  <p className="text-muted-foreground">
                    Get your first script protected and distributed in under 5
                    minutes.
                  </p>
                  <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                    <li>Create an account and log in to your dashboard</li>
                    <li>Click "New Script" and paste your Lua code</li>
                    <li>Select your protection mode (Key, Whitelist, or Keyless)</li>
                    <li>Copy your generated loader and distribute it</li>
                  </ol>
                </div>
              </section>

              {/* Creating Scripts */}
              <section id="creating-scripts">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Code className="w-6 h-6 text-primary" />
                  Creating Scripts
                </h2>
                <div className="glass-card p-6 space-y-4">
                  <p className="text-muted-foreground">
                    When you upload a script, it's automatically obfuscated to
                    prevent reverse engineering. Here's what happens:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>Variable name randomization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>String encryption and encoding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>Control flow obfuscation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span>Anti-tamper checks embedded</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Key System */}
              <section id="key-system">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Key className="w-6 h-6 text-primary" />
                  Key System
                </h2>
                <div className="glass-card p-6 space-y-4">
                  <p className="text-muted-foreground">
                    The key system allows you to distribute time-limited or
                    usage-limited access to your scripts.
                  </p>
                  <div className="code-block">
                    <code className="text-sm">
                      <span className="text-muted-foreground">
                        -- User loads your script with their key
                      </span>
                      {"\n"}
                      <span className="text-accent">getgenv</span>().
                      <span className="text-primary">SCRIPT_KEY</span> ={" "}
                      <span className="text-success">"abc123-xyz789"</span>
                      {"\n"}
                      <span className="text-accent">loadstring</span>(
                      <span className="text-accent">game</span>:
                      <span className="text-accent">HttpGet</span>(
                      <span className="text-success">
                        "https://api.scripthub.dev/v1/load/your-script"
                      </span>
                      ))()
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Keys can be configured with: expiration time, max uses, HWID
                    binding, and more.
                  </p>
                </div>
              </section>

              {/* Whitelist */}
              <section id="whitelist">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  Whitelist Mode
                </h2>
                <div className="glass-card p-6 space-y-4">
                  <p className="text-muted-foreground">
                    Whitelist mode allows specific users to access your script
                    without a key. Users are identified by their Roblox username
                    or User ID.
                  </p>
                  <div className="code-block">
                    <code className="text-sm">
                      <span className="text-muted-foreground">
                        -- No key needed for whitelisted users
                      </span>
                      {"\n"}
                      <span className="text-accent">loadstring</span>(
                      <span className="text-accent">game</span>:
                      <span className="text-accent">HttpGet</span>(
                      <span className="text-success">
                        "https://api.scripthub.dev/v1/load/your-script"
                      </span>
                      ))()
                    </code>
                  </div>
                </div>
              </section>

              {/* API Reference */}
              <section id="api-reference">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Lock className="w-6 h-6 text-primary" />
                  API Reference
                </h2>
                <div className="glass-card p-6 space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Load Script
                    </h3>
                    <div className="code-block text-sm">
                      <code>
                        <span className="text-primary">GET</span>{" "}
                        <span className="text-foreground">
                          /api/v1/load/:scriptId
                        </span>
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Returns the obfuscated script if the request is authorized.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Validate Key
                    </h3>
                    <div className="code-block text-sm">
                      <code>
                        <span className="text-primary">POST</span>{" "}
                        <span className="text-foreground">
                          /api/v1/keys/validate
                        </span>
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Validates a key and returns its status and remaining uses.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Docs;

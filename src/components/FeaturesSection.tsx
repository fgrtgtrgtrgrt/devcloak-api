import { Shield, Key, Users, Code, Zap, Lock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Script Obfuscation",
    description: "Automatically obfuscate your Lua scripts to prevent reverse engineering and source leaks.",
  },
  {
    icon: Key,
    title: "Key System",
    description: "Generate unique keys for users with configurable expiration and usage limits.",
  },
  {
    icon: Users,
    title: "Whitelist Management",
    description: "Control exactly who can access your scripts with user-level whitelisting.",
  },
  {
    icon: Code,
    title: "API Loader",
    description: "Secure API endpoints that serve your protected scripts via loadstring.",
  },
  {
    icon: Zap,
    title: "Instant Updates",
    description: "Update your scripts instantly without requiring users to get new loaders.",
  },
  {
    icon: Lock,
    title: "Anti-Tamper",
    description: "Built-in protection against script modification and unauthorized distribution.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Everything You Need</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A complete platform for managing and distributing your Roblox scripts securely.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="stat-card group cursor-default animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

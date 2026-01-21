import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-40" />
      
      {/* Floating Orbs - Purple/Pink */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/20 rounded-full blur-[80px] animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-purple-500/15 rounded-full blur-[60px] animate-float" style={{ animationDelay: '4s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Zap className="w-4 h-4" />
            <span>Secure Script Distribution Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <span className="text-foreground">Protect & Distribute</span>
            <br />
            <span className="gradient-text">Roblox Scripts</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Advanced key system, automatic obfuscation, and secure API-based loader. 
            Keep your scripts protected from leaks and unauthorized access.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/auth">
              <Button variant="hero" size="xl">
                Start Building
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/docs">
              <Button variant="glass" size="xl">
                View Documentation
              </Button>
            </Link>
          </div>

          {/* Code Preview */}
          <div className="glass-card p-6 max-w-2xl mx-auto text-left animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-destructive/80" />
              <div className="w-3 h-3 rounded-full bg-warning/80" />
              <div className="w-3 h-3 rounded-full bg-success/80" />
              <span className="text-xs text-muted-foreground ml-2 font-mono">loader.lua</span>
            </div>
            <pre className="font-mono text-sm overflow-x-auto">
              <code>
                <span className="text-accent">getgenv</span>
                <span className="text-foreground">().</span>
                <span className="text-primary">SCRIPT_KEY</span>
                <span className="text-foreground"> = </span>
                <span className="text-success">"YOUR_KEY_HERE"</span>
                {"\n"}
                <span className="text-accent">loadstring</span>
                <span className="text-foreground">(</span>
                <span className="text-accent">game</span>
                <span className="text-foreground">:</span>
                <span className="text-accent">HttpGet</span>
                <span className="text-foreground">(</span>
                <span className="text-success">"https://api.viziondev.com/v1/load/abc123"</span>
                <span className="text-foreground">))()</span>
              </code>
            </pre>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm">Obfuscated Scripts</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-5 h-5 text-primary" />
              <span className="text-sm">Key Protection</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm">Fast API</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

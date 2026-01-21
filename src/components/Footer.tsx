import { Eye, Github, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border/50 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-lg">
              <span className="gradient-text">Vizion</span>
              <span className="text-foreground">Dev</span>
            </span>
          </Link>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/docs" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link to="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} VizionDevelopments. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

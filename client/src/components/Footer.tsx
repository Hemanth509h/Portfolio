import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type PortfolioData } from "@shared/schema";

export function Footer() {
  const { data: portfolioData } = useQuery<PortfolioData>({
    queryKey: ["/api/portfolio"],
  });
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="font-semibold text-xl text-primary mb-4">
              {portfolioData?.name || "Alex Developer"}
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {portfolioData?.bio || "Full stack developer passionate about creating exceptional digital experiences with modern technologies and clean code."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Quick Links</h3>
            <div className="space-y-2">
              {["Home", "About", "Projects", "Skills", "Contact"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    const element = document.getElementById(item.toLowerCase());
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="block text-muted-foreground text-sm hover:text-primary transition-colors"
                  data-testid={`link-footer-${item.toLowerCase()}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Social & Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Connect</h3>
            <div className="flex space-x-3 mb-4">
              <Button
                variant="ghost"
                size="icon"
                data-testid="link-footer-github"
                onClick={() => portfolioData?.githubUrl ? window.open(portfolioData.githubUrl, '_blank') : console.log("Footer GitHub clicked")}
              >
                <Github className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                data-testid="link-footer-linkedin"
                onClick={() => portfolioData?.linkedinUrl ? window.open(portfolioData.linkedinUrl, '_blank') : console.log("Footer LinkedIn clicked")}
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                data-testid="link-footer-email"
                onClick={() => portfolioData?.email ? window.open(`mailto:${portfolioData.email}`) : console.log("Footer Email clicked")}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-sm">
              {portfolioData?.email || "alex@example.com"}
              <br />
              {portfolioData?.location || "San Francisco, CA"}
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <div className="flex items-center">
            <span>© {currentYear} {portfolioData?.name || "Alex Developer"}. Made with</span>
            <Heart className="h-4 w-4 mx-1 text-red-500 fill-current" />
            <span>and lots of coffee.</span>
          </div>
          <div className="mt-4 md:mt-0">
            <span data-testid="text-portfolio-version">Portfolio v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
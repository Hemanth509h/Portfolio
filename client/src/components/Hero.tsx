import { useEffect, useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type PortfolioData } from "@shared/schema";
import heroImage from "@assets/generated_images/Developer_workspace_hero_image_546a984f.png";

export function Hero() {
  const { data: portfolioData } = useQuery<PortfolioData>({
    queryKey: ["/api/portfolio"],
  });
  
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Use skills from portfolio data for typewriter effect, with fallback to default roles
  const roles = useMemo(() => {
    const defaultRoles = ["Full Stack Developer", "React Specialist", "Node.js Expert", "UI/UX Enthusiast"];
    return portfolioData?.skills && portfolioData.skills.length > 0 
      ? portfolioData.skills 
      : defaultRoles;
  }, [portfolioData?.skills]);

  // Refs for cleanup
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextRoleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevRolesRef = useRef<string[]>([]);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset typewriter state when roles array content changes
  useEffect(() => {
    const rolesChanged = JSON.stringify(prevRolesRef.current) !== JSON.stringify(roles);
    
    if (rolesChanged) {
      // Clear all existing timeouts and intervals to prevent conflicts
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
      if (nextRoleTimeoutRef.current) {
        clearTimeout(nextRoleTimeoutRef.current);
        nextRoleTimeoutRef.current = null;
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      
      // Reset to first role and restart typing animation
      setCurrentRole(0);
      setDisplayText("");
      setIsTyping(true);
      
      // Update the ref to current roles
      prevRolesRef.current = [...roles];
    }
  }, [roles]);

  useEffect(() => {
    // Clear any existing timeouts
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    if (nextRoleTimeoutRef.current) {
      clearTimeout(nextRoleTimeoutRef.current);
      nextRoleTimeoutRef.current = null;
    }
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    if (roles.length === 0) return;

    const role = roles[currentRole % roles.length];
    let currentIndex = 0;

    if (isTyping) {
      typingIntervalRef.current = setInterval(() => {
        if (currentIndex <= role.length) {
          setDisplayText(role.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsTyping(false);
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          pauseTimeoutRef.current = setTimeout(() => {
            nextRoleTimeoutRef.current = setTimeout(() => {
              setCurrentRole((prev) => (prev + 1) % roles.length);
              setDisplayText("");
              setIsTyping(true);
            }, 1000);
          }, 2000);
        }
      }, 100);

      return () => {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        if (pauseTimeoutRef.current) {
          clearTimeout(pauseTimeoutRef.current);
          pauseTimeoutRef.current = null;
        }
        if (nextRoleTimeoutRef.current) {
          clearTimeout(nextRoleTimeoutRef.current);
          nextRoleTimeoutRef.current = null;
        }
      };
    }
  }, [currentRole, isTyping, roles]);

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="min-h-screen flex items-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Developer workspace"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/70" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-foreground">Hi, I'm</span>{" "}
            <span className="text-primary">{portfolioData?.name || "Alex"}</span>
          </h1>
          
          <div className="h-16 mb-8">
            <p className="text-2xl md:text-3xl text-muted-foreground">
              <span className="text-primary">{displayText}</span>
              <span className="animate-pulse">|</span>
            </p>
          </div>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            {portfolioData?.bio || "I create modern, scalable web applications with clean code and exceptional user experiences. Passionate about building digital solutions that make a difference."}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button 
              size="lg" 
              onClick={scrollToProjects}
              data-testid="button-view-projects"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              View My Work
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={scrollToContact}
              data-testid="button-get-in-touch"
              className="px-8"
            >
              Get In Touch
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="link-github"
              className="hover-elevate"
              onClick={() => portfolioData?.githubUrl ? window.open(portfolioData.githubUrl, '_blank') : console.log("GitHub clicked")}
            >
              <Github className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="link-linkedin"
              className="hover-elevate"
              onClick={() => portfolioData?.linkedinUrl ? window.open(portfolioData.linkedinUrl, '_blank') : console.log("LinkedIn clicked")}
            >
              <Linkedin className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="link-email"
              className="hover-elevate"
              onClick={() => portfolioData?.email ? window.open(`mailto:${portfolioData.email}`) : console.log("Email clicked")}
            >
              <Mail className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              data-testid="button-download-resume"
              className="hover-elevate ml-4"
              onClick={() => portfolioData?.resumeUrl ? window.open(portfolioData.resumeUrl, '_blank') : console.log("Resume download clicked")}
            >
              <Download className="h-4 w-4 mr-2" />
              Resume
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
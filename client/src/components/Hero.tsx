import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Mail, Download } from "lucide-react";
import heroImage from "@assets/generated_images/Developer_workspace_hero_image_546a984f.png";

const roles = ["Full Stack Developer", "React Specialist", "Node.js Expert", "UI/UX Enthusiast"];

export function Hero() {
  const [currentRole, setCurrentRole] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const role = roles[currentRole];
    let currentIndex = 0;

    if (isTyping) {
      const typingInterval = setInterval(() => {
        if (currentIndex <= role.length) {
          setDisplayText(role.slice(0, currentIndex));
          currentIndex++;
        } else {
          setIsTyping(false);
          setTimeout(() => {
            setIsTyping(false);
            setTimeout(() => {
              setCurrentRole((prev) => (prev + 1) % roles.length);
              setDisplayText("");
              setIsTyping(true);
            }, 1000);
          }, 2000);
          clearInterval(typingInterval);
        }
      }, 100);

      return () => clearInterval(typingInterval);
    }
  }, [currentRole, isTyping]);

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
            <span className="text-primary">Alex</span>
          </h1>
          
          <div className="h-16 mb-8">
            <p className="text-2xl md:text-3xl text-muted-foreground">
              <span className="text-primary">{displayText}</span>
              <span className="animate-pulse">|</span>
            </p>
          </div>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            I create modern, scalable web applications with clean code and exceptional user experiences. 
            Passionate about building digital solutions that make a difference.
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
              onClick={() => console.log("GitHub clicked")}
            >
              <Github className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="link-linkedin"
              className="hover-elevate"
              onClick={() => console.log("LinkedIn clicked")}
            >
              <Linkedin className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="link-email"
              className="hover-elevate"
              onClick={() => console.log("Email clicked")}
            >
              <Mail className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              data-testid="button-download-resume"
              className="hover-elevate ml-4"
              onClick={() => console.log("Resume download clicked")}
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
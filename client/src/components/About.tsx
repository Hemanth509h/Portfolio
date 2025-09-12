import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, MapPin, Calendar } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export function About() {
  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              About Me
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get to know the developer behind the code. My journey, passion, and what drives me to create exceptional digital experiences.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Profile Image */}
          <ScrollReveal direction="left" delay={100}>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                <div className="w-80 h-80 bg-muted rounded-xl flex items-center justify-center">
                  <div className="text-muted-foreground text-6xl font-mono">
                    &lt;/&gt;
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* About Content */}
          <ScrollReveal direction="right" delay={200}>
            <div>
            <h3 className="text-2xl font-semibold mb-6 text-foreground">
              Passionate Full Stack Developer
            </h3>
            
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              <p>
                I'm a dedicated full stack developer with a passion for creating innovative web applications 
                that solve real-world problems. With over 3 years of experience in modern web technologies, 
                I specialize in building scalable, user-friendly applications.
              </p>
              
              <p>
                My journey began with a curiosity for how things work on the web. Today, I work with cutting-edge 
                technologies like React, Node.js, and TypeScript to bring ideas to life. I believe in writing 
                clean, maintainable code and creating exceptional user experiences.
              </p>
              
              <p>
                When I'm not coding, you'll find me exploring new technologies, contributing to open source 
                projects, or sharing knowledge with the developer community.
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="border-0 bg-card/50">
                <CardContent className="p-4 flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-medium" data-testid="text-location">San Francisco, CA</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-card/50">
                <CardContent className="p-4 flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Experience</div>
                    <div className="font-medium" data-testid="text-experience">3+ Years</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={scrollToContact}
                data-testid="button-lets-work-together"
              >
                Let's Work Together
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                data-testid="button-download-cv"
                onClick={() => window.location.href = "/api/resume/download"}
              >
                <Download className="h-4 w-4 mr-2" />
                Download CV
              </Button>
            </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
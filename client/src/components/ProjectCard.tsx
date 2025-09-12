import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

export function ProjectCard({
  title,
  description,
  image,
  technologies,
  liveUrl,
  githubUrl,
  featured = false,
}: ProjectCardProps) {
  return (
    <Card className={`group hover-elevate overflow-hidden transition-all duration-300 ${
      featured ? "border-primary/50" : ""
    }`} data-testid={`card-project-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="aspect-video overflow-hidden bg-muted">
        <img
          src={image}
          alt={`${title} project screenshot`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          {featured && (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              Featured
            </Badge>
          )}
        </div>
        
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {technologies.map((tech) => (
            <Badge 
              key={tech} 
              variant="outline" 
              className="text-xs"
              data-testid={`badge-tech-${tech.toLowerCase()}`}
            >
              {tech}
            </Badge>
          ))}
        </div>
        
        <div className="flex gap-3">
          {liveUrl && (
            <Button 
              size="sm" 
              className="flex-1"
              data-testid={`button-live-demo-${title.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => console.log(`Live demo clicked for ${title}`)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Live Demo
            </Button>
          )}
          {githubUrl && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              data-testid={`button-github-${title.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => console.log(`GitHub clicked for ${title}`)}
            >
              <Github className="h-4 w-4 mr-2" />
              Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
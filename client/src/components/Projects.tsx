import { useState, useMemo } from "react";
import { ProjectCard } from "./ProjectCard";
import { ProjectFilter } from "./ProjectFilter";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { type PortfolioData } from "@shared/schema";

// Define the project interface
interface Project {
  id: string;
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

// Fallback projects in case no projects are loaded from admin
const fallbackProjects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with React, Node.js, and Stripe integration. Features include user authentication, product management, shopping cart, and secure payments.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "TailwindCSS"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: true,
  },
];

export function Projects() {
  const { data: portfolioData } = useQuery<PortfolioData>({
    queryKey: ["/api/portfolio"],
  });
  
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);
  
  // Parse projects from JSON string or use fallback
  const projects = useMemo(() => {
    if (portfolioData?.projects) {
      try {
        const parsedProjects = JSON.parse(portfolioData.projects);
        return Array.isArray(parsedProjects) && parsedProjects.length > 0 
          ? parsedProjects 
          : fallbackProjects;
      } catch (error) {
        console.error('Error parsing projects JSON:', error);
        return fallbackProjects;
      }
    }
    return fallbackProjects;
  }, [portfolioData?.projects]);

  // Get all unique technologies from projects
  const allTechnologies = useMemo(() => {
    const techSet = new Set<string>();
    projects.forEach((project: Project) => {
      project.technologies.forEach((tech: string) => techSet.add(tech));
    });
    return Array.from(techSet).sort();
  }, [projects]);

  // Filter projects based on selected technologies
  const filteredProjects = useMemo(() => {
    if (selectedTechnologies.length === 0) {
      return projects;
    }
    return projects.filter(project =>
      selectedTechnologies.every(tech =>
        project.technologies.includes(tech)
      )
    );
  }, [selectedTechnologies]);
  return (
    <section id="projects" className="py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Featured Projects
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A showcase of my recent work, featuring modern web applications built with cutting-edge technologies
            and best practices.
          </p>
        </div>

        <ProjectFilter
          technologies={allTechnologies}
          selectedTechnologies={selectedTechnologies}
          onFilterChange={setSelectedTechnologies}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <div
                key={project.id || project.title}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProjectCard {...project} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <div className="text-muted-foreground mb-4">
                <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                <p>Try adjusting your technology filters to see more projects.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedTechnologies([])}
                data-testid="button-clear-all-filters"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            Want to see more of my work?
          </p>
          <Button 
            variant="outline" 
            size="lg"
            data-testid="button-view-all-projects"
            onClick={() => console.log("View all projects clicked")}
          >
            View All Projects on GitHub
          </Button>
        </div>
      </div>
    </section>
  );
}
import { ProjectCard } from "./ProjectCard";
import { Button } from "@/components/ui/button";

// Mock project data - todo: replace with real project data
const projects = [
  {
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with React, Node.js, and Stripe integration. Features include user authentication, product management, shopping cart, and secure payments.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "TailwindCSS"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: true,
  },
  {
    title: "Task Management App",
    description: "A collaborative project management tool with real-time updates, drag-and-drop functionality, and team collaboration features.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
    technologies: ["React", "Socket.io", "Express", "MongoDB", "Zustand"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
  },
  {
    title: "Weather Dashboard",
    description: "A responsive weather application with location-based forecasts, interactive maps, and detailed weather analytics.",
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&h=400&fit=crop",
    technologies: ["React", "TypeScript", "OpenWeather API", "Chart.js"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
  },
  {
    title: "Social Media Dashboard",
    description: "An analytics dashboard for social media management with data visualization, scheduling, and performance tracking.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    technologies: ["Next.js", "Prisma", "PostgreSQL", "Recharts", "OAuth"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
  },
];

export function Projects() {
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={index} {...project} />
          ))}
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
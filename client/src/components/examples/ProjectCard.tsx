import { ProjectCard } from '../ProjectCard';

export default function ProjectCardExample() {
  return (
    <div className="p-6">
      <ProjectCard
        title="E-Commerce Platform"
        description="A full-stack e-commerce solution with React, Node.js, and Stripe integration. Features include user authentication, product management, shopping cart, and secure payments."
        image="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
        technologies={["React", "Node.js", "PostgreSQL", "Stripe", "TailwindCSS"]}
        liveUrl="https://example.com"
        githubUrl="https://github.com"
        featured={true}
      />
    </div>
  );
}
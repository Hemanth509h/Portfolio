import { Code, Database, Palette, Globe } from "lucide-react";
import { SkillCard } from "./SkillCard";

// Mock skills data - todo: replace with real skills data
const skillCategories = [
  {
    icon: Code,
    title: "Frontend Development",
    skills: ["React/Next.js", "TypeScript", "TailwindCSS", "Vue.js", "Angular"],
  },
  {
    icon: Database,
    title: "Backend Development",
    skills: ["Node.js", "Python", "PostgreSQL", "MongoDB", "Redis"],
  },
  {
    icon: Globe,
    title: "DevOps & Tools",
    skills: ["Docker", "AWS", "CI/CD", "Git", "Linux"],
  },
  {
    icon: Palette,
    title: "Design & UX",
    skills: ["Figma", "UI/UX Design", "Responsive Design", "Accessibility", "Prototyping"],
  },
];

export function Skills() {
  return (
    <section id="skills" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">
            Skills & Expertise
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A comprehensive toolkit for building modern, scalable applications from concept to deployment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category, index) => (
            <SkillCard key={index} {...category} />
          ))}
        </div>

        {/* Technical Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2" data-testid="text-years-experience">
              3+
            </div>
            <div className="text-muted-foreground text-sm">Years Experience</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2" data-testid="text-projects-completed">
              50+
            </div>
            <div className="text-muted-foreground text-sm">Projects Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2" data-testid="text-technologies">
              15+
            </div>
            <div className="text-muted-foreground text-sm">Technologies</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2" data-testid="text-coffee-cups">
              1000+
            </div>
            <div className="text-muted-foreground text-sm">Cups of Coffee</div>
          </div>
        </div>
      </div>
    </section>
  );
}
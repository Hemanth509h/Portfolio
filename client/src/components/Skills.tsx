import { Code } from "lucide-react";
import { SkillCard } from "./SkillCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useQuery } from "@tanstack/react-query";

export function Skills() {
  const { data: portfolioData } = useQuery({
    queryKey: ["/api/portfolio"],
  });

  // Use skills from API or fallback to default skills
  const skills = portfolioData?.skills || ["React", "TypeScript", "Node.js", "PostgreSQL", "TailwindCSS"];

  // Group skills into categories (simple grouping)
  const skillCategories = [
    {
      icon: Code,
      title: "Technologies & Skills",
      skills: skills,
    },
  ];

  return (
    <section id="skills" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">
              Skills & Expertise
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A comprehensive toolkit for building modern, scalable applications from concept to deployment.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category, index) => (
            <ScrollReveal key={index} delay={index * 100} direction="up">
              <SkillCard {...category} />
            </ScrollReveal>
          ))}
        </div>

        {/* Technical Stats */}
        <ScrollReveal delay={400}>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">3+</div>
              <div className="text-muted-foreground">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Projects Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">20+</div>
              <div className="text-muted-foreground">Technologies</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-muted-foreground">Client Satisfaction</div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
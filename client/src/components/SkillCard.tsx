import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SkillCardProps {
  icon: LucideIcon;
  title: string;
  skills: string[];
  color?: string;
}

export function SkillCard({ icon: Icon, title, skills, color = "text-primary" }: SkillCardProps) {
  return (
    <Card className="hover-elevate transition-all duration-300" data-testid={`card-skill-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="p-6 text-center">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg bg-primary/10 mb-4 ${color}`}>
          <Icon className="h-8 w-8" />
        </div>
        
        <h3 className="text-xl font-semibold mb-4 text-foreground">
          {title}
        </h3>
        
        <div className="space-y-2">
          {skills.map((skill, index) => (
            <div key={index} className="text-muted-foreground text-sm">
              {skill}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
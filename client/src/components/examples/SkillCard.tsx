import { SkillCard } from '../SkillCard';
import { Code } from 'lucide-react';

export default function SkillCardExample() {
  return (
    <div className="p-6">
      <SkillCard
        icon={Code}
        title="Frontend Development"
        skills={["React/Next.js", "TypeScript", "TailwindCSS", "Vue.js", "Angular"]}
      />
    </div>
  );
}
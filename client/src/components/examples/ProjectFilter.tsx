import { useState } from 'react';
import { ProjectFilter } from '../ProjectFilter';

export default function ProjectFilterExample() {
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(['React', 'TypeScript']);
  
  const mockTechnologies = [
    'React', 'TypeScript', 'Node.js', 'Python', 'PostgreSQL', 
    'MongoDB', 'Socket.io', 'Express', 'Next.js', 'Vue.js',
    'TailwindCSS', 'Stripe', 'OpenAI API', 'Chart.js', 'Recharts'
  ];

  return (
    <div className="p-6">
      <ProjectFilter
        technologies={mockTechnologies}
        selectedTechnologies={selectedTechnologies}
        onFilterChange={setSelectedTechnologies}
      />
    </div>
  );
}
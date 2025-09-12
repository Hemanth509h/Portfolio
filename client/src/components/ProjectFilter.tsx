import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectFilterProps {
  technologies: string[];
  selectedTechnologies: string[];
  onFilterChange: (technologies: string[]) => void;
}

export function ProjectFilter({ technologies, selectedTechnologies, onFilterChange }: ProjectFilterProps) {
  const [showAll, setShowAll] = useState(technologies.length <= 8);

  const handleTechnologyToggle = (tech: string) => {
    const newSelected = selectedTechnologies.includes(tech)
      ? selectedTechnologies.filter(t => t !== tech)
      : [...selectedTechnologies, tech];
    onFilterChange(newSelected);
  };

  const handleClearAll = () => {
    onFilterChange([]);
  };

  const visibleTechnologies = showAll ? technologies : technologies.slice(0, 8);
  const remainingCount = technologies.length - 8;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Filter by Technology</h3>
        {selectedTechnologies.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            data-testid="button-clear-filters"
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All ({selectedTechnologies.length})
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {visibleTechnologies.map((tech) => {
          const isSelected = selectedTechnologies.includes(tech);
          return (
            <button
              key={tech}
              onClick={() => handleTechnologyToggle(tech)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTechnologyToggle(tech);
                }
              }}
              className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-all duration-200 hover-elevate focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
                isSelected
                  ? "bg-primary text-primary-foreground border border-primary"
                  : "bg-secondary text-secondary-foreground border border-border hover:border-primary/50"
              }`}
              data-testid={`filter-tech-${tech.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              aria-pressed={isSelected}
              role="button"
            >
              {tech}
            </button>
          );
        })}
        
        {!showAll && remainingCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(true)}
            data-testid="button-show-more-filters"
            className="text-muted-foreground hover:text-primary text-xs"
          >
            +{remainingCount} more
          </Button>
        )}
        
        {showAll && technologies.length > 8 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(false)}
            data-testid="button-show-less-filters"
            className="text-muted-foreground hover:text-primary text-xs"
          >
            Show less
          </Button>
        )}
      </div>

      {selectedTechnologies.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          Showing projects with: {selectedTechnologies.join(", ")}
        </div>
      )}
    </div>
  );
}
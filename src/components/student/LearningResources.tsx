import React from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { ResourceCard } from './ResourceCard';
import { BookMarked } from 'lucide-react';
import type { LearningResource } from '../../types/learning';
import './LearningResources.css';

interface LearningResourcesProps {
  resources: LearningResource[];
  className?: string;
}

export const LearningResources: React.FC<LearningResourcesProps> = ({
  resources,
  className = '',
}) => {
  if (resources.length === 0) return null;

  return (
    <Card variant="default" className={`resources-section ${className}`}>
      <CardHeader>
        <div className="resources-header">
          <BookMarked size={18} className="resources-icon" />
          <h3 className="resources-title">Learn More</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="resources-grid">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

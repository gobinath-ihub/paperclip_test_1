import React from 'react';
import { Badge } from '../common/Badge';
import {
  Video, BookOpen, FileText, Dumbbell,
  ExternalLink, ArrowRight,
} from 'lucide-react';
import type { LearningResource } from '../../types/learning';
import './ResourceCard.css';

interface ResourceCardProps {
  resource: LearningResource;
}

const typeConfig: Record<string, { icon: React.ReactNode; action: string; color: string }> = {
  video: { icon: <Video size={18} />, action: 'Watch video', color: 'var(--destructive)' },
  book: { icon: <BookOpen size={18} />, action: 'Open reference', color: 'var(--success)' },
  article: { icon: <FileText size={18} />, action: 'Read article', color: 'var(--primary)' },
  practice: { icon: <Dumbbell size={18} />, action: 'Practice', color: 'var(--warning)' },
};

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const config = typeConfig[resource.type] || typeConfig.article;

  const content = (
    <div className="resource-card">
      <div className="resource-card-top">
        <div className="resource-type-icon" style={{ color: config.color }}>
          {config.icon}
        </div>
        <div className="resource-card-info">
          <h4 className="resource-card-title">{resource.title}</h4>
          <span className="resource-card-source">{resource.source}</span>
        </div>
      </div>

      {resource.description && (
        <p className="resource-card-desc line-clamp-2">{resource.description}</p>
      )}

      <div className="resource-card-meta">
        {resource.topic && <Badge variant="muted" size="sm">{resource.topic}</Badge>}
        {resource.difficulty && <Badge variant="muted" size="sm">{resource.difficulty}</Badge>}
      </div>

      {resource.reason && (
        <p className="resource-card-reason">
          <span className="reason-label">Why this helps:</span> {resource.reason}
        </p>
      )}

      <div className="resource-card-action">
        <span>{config.action}</span>
        <ArrowRight size={14} />
      </div>
    </div>
  );

  if (resource.url) {
    return (
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="resource-card-link"
        aria-label={`${config.action}: ${resource.title}`}
      >
        {content}
        <ExternalLink size={14} className="resource-external-icon" />
      </a>
    );
  }

  return content;
};

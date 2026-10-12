import React, { useState, useMemo } from 'react';
import { useResources } from '../../hooks/useResources';
import { ResourceCard } from '../../components/student/ResourceCard';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Search, BookOpen } from 'lucide-react';
import './ResourcesPage.css';

export const ResourcesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const { isLoading, error, resources, refetch } = useResources();

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const title = res.title || '';
      const description = res.description || '';
      const topic = res.topic || '';
      const type = res.type || '';
      const difficulty = res.difficulty || '';

      const matchesSearch =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || type.toLowerCase() === selectedType.toLowerCase();
      const matchesDiff = selectedDifficulty === 'all' || difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      return matchesSearch && matchesType && matchesDiff;
    });
  }, [resources, searchQuery, selectedType, selectedDifficulty]);

  return (
    <div className="resources-page animate-fade-in">
      <div className="resources-page-header">
        <div>
          <span className="resources-kicker">CURATED REPOSITORY</span>
          <h1 className="resources-title">Targeted Learning Resources</h1>
          <p className="resources-subtitle">
            Explore step-by-step videos, interactive practice exercises, and concise reference guides calibrated to clear common algebra misconceptions.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="resources-controls-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search resources by topic, keywords, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-pills-row">
          <div className="filter-select-group">
            <span className="filter-group-label">Type:</span>
            <select
              className="resource-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="video">Video</option>
              <option value="article">Article / Guide</option>
              <option value="practice">Practice Module</option>
              <option value="simulation">Interactive</option>
            </select>
          </div>

          <div className="filter-select-group">
            <span className="filter-group-label">Difficulty:</span>
            <select
              className="resource-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="foundational">Foundational</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resource Count Indicator */}
      <div className="resources-results-meta">
        <span>Showing {filteredResources.length} learning resources</span>
      </div>

      {/* Grid of Resources */}
      {isLoading ? (
        <div className="resources-grid">
          <Skeleton height="200px" borderRadius="var(--radius-xl)" />
          <Skeleton height="200px" borderRadius="var(--radius-xl)" />
          <Skeleton height="200px" borderRadius="var(--radius-xl)" />
          <Skeleton height="200px" borderRadius="var(--radius-xl)" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : filteredResources.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={40} />}
          title="No resources match your filters"
          description="Try broadening your search term or selecting 'All Types' to explore available learning materials."
          action={{
            label: 'Reset Filters',
            onClick: () => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedDifficulty('all');
            },
          }}
        />
      ) : (
        <div className="resources-grid">
          {filteredResources.map((res) => (
            <ResourceCard key={res.id} resource={res} />
          ))}
        </div>
      )}
    </div>
  );
};

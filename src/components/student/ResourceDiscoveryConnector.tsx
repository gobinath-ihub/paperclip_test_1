import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import {
  Globe, Video, BookOpen, ExternalLink,
  Play, Clock, AlertCircle, RefreshCw, Layers,
  Settings, CheckCircle2, Radio, Server
} from 'lucide-react';
import { OpenClawIcon } from '../common/OpenClawIcon';
import { getOpenClawBaseUrl, setOpenClawBaseUrl, checkOpenClawHealth } from '../../lib/api';
import type { CategorizedResources, LearningResource } from '../../types/learning';
import './ResourceDiscoveryConnector.css';

interface ResourceDiscoveryConnectorProps {
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error';
  topic: string;
  query?: string;
  misconceptionLabel?: string;
  resources: CategorizedResources;
  errorMessage?: string | null;
  onRetry?: () => void;
  className?: string;
}

type TabType = 'all' | 'web' | 'youtube' | 'books';

export const ResourceDiscoveryConnector: React.FC<ResourceDiscoveryConnectorProps> = ({
  status,
  topic,
  query,
  misconceptionLabel,
  resources,
  errorMessage,
  onRetry,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [ngrokUrlInput, setNgrokUrlInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{ ok?: boolean; message?: string } | null>(null);

  useEffect(() => {
    setNgrokUrlInput(getOpenClawBaseUrl());
  }, [isConfigOpen]);

  const handleTestTunnel = async () => {
    setIsTesting(true);
    setHealthStatus(null);
    const res = await checkOpenClawHealth(ngrokUrlInput);
    setIsTesting(false);
    setHealthStatus(res);
  };

  const handleSaveTunnel = () => {
    setOpenClawBaseUrl(ngrokUrlInput);
    setIsConfigOpen(false);
    if (onRetry) {
      onRetry();
    }
  };

  if (status === 'idle') {
    return null;
  }

  const webList = resources.web || [];
  const youtubeList = resources.youtube || [];
  const booksList = resources.books || [];
  const totalCount = webList.length + youtubeList.length + booksList.length;

  return (
    <>
      <Card variant="default" className={`resource-discovery-connector animate-fade-in ${className}`}>
      <CardHeader className="discovery-card-header">
        <div className="discovery-header-wrapper">
          <div className="discovery-title-group">
            <div className="discovery-icon-pill openclaw-icon-pill" title="OpenClaw Extraction Engine">
              <OpenClawIcon size={22} className="openclaw-header-icon" />
              <span className="openclaw-active-dot" title="OpenClaw active" />
            </div>
            <div className="discovery-title-details">
              <div className="discovery-title-badge-row">
                <div
                  className="openclaw-hero-pill interactive-pill"
                  title="Click to configure or test OpenClaw Ngrok Tunnel"
                  role="button"
                  tabIndex={0}
                  onClick={() => setIsConfigOpen(true)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsConfigOpen(true)}
                >
                  <OpenClawIcon size={17} />
                  <span className="openclaw-hero-text">OpenClaw Executed</span>
                  <span className="openclaw-live-badge">ACTIVE</span>
                </div>
                <button
                  type="button"
                  className="openclaw-settings-trigger"
                  onClick={() => setIsConfigOpen(true)}
                  title="OpenClaw Ngrok Tunnel Settings"
                  aria-label="OpenClaw Ngrok Settings"
                >
                  <Settings size={14} />
                </button>
                <h3 className="discovery-title">Recommended Learning Resources</h3>
              </div>
              <p className="discovery-subtitle">
                {misconceptionLabel ? (
                  <>
                    OpenClaw executed suggestions to provide targeted resources for{' '}
                    <span className="discovery-highlight">{misconceptionLabel}</span> in{' '}
                    <span className="discovery-highlight">{topic || 'Algebra'}</span>
                  </>
                ) : (
                  <>
                    OpenClaw executed multi-source extraction to suggest targeted learning resources for{' '}
                    <span className="discovery-highlight">{topic || 'this concept'}</span>.
                  </>
                )}
              </p>
            </div>
          </div>

          {query && status === 'success' && (
            <div className="discovery-query-pill" title={`OpenClaw extracted: ${query}`}>
              <span>Extracted:</span> {query}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        {status === 'success' && totalCount > 0 && (
          <div className="discovery-tabs-bar" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'all'}
              className={`discovery-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <Layers size={15} />
              <span>All Resources</span>
              <span className="tab-count">{totalCount}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'web'}
              className={`discovery-tab ${activeTab === 'web' ? 'active' : ''}`}
              onClick={() => setActiveTab('web')}
            >
              <Globe size={15} />
              <span>Web Search</span>
              <span className="tab-count">{webList.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'youtube'}
              className={`discovery-tab ${activeTab === 'youtube' ? 'active' : ''}`}
              onClick={() => setActiveTab('youtube')}
            >
              <Video size={15} />
              <span>YouTube</span>
              <span className="tab-count">{youtubeList.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'books'}
              className={`discovery-tab ${activeTab === 'books' ? 'active' : ''}`}
              onClick={() => setActiveTab('books')}
            >
              <BookOpen size={15} />
              <span>Books & Guides</span>
              <span className="tab-count">{booksList.length}</span>
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Loading State */}
        {status === 'loading' && (
          <div className="discovery-loading-state">
            <div className="discovery-loading-header">
              <div className="openclaw-loading-avatar">
                <OpenClawIcon size={24} className="openclaw-loading-avatar-icon" />
                <RefreshCw size={14} className="discovery-spinner" />
              </div>
              <div className="openclaw-loading-info">
                <span className="openclaw-loading-title">OpenClaw Crawler executing resource extraction...</span>
                <span className="openclaw-loading-sub">Filtering pedagogical solutions for {topic || 'Linear Equations'}</span>
              </div>
            </div>
            <div className="discovery-skeletons-grid">
              <div className="discovery-skeleton-card skeleton-pulse" />
              <div className="discovery-skeleton-card skeleton-pulse" />
              <div className="discovery-skeleton-card skeleton-pulse" />
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="discovery-error-state">
            <AlertCircle size={24} className="discovery-error-icon" />
            <div className="discovery-error-content">
              <h4>OpenClaw resource extraction is temporarily unavailable.</h4>
              <p>{errorMessage || 'Could not connect to external OpenClaw extraction connectors.'}</p>
            </div>
            {onRetry && (
              <Button variant="secondary" size="sm" onClick={onRetry}>
                <RefreshCw size={14} className="mr-1" /> Retry OpenClaw Search
              </Button>
            )}
          </div>
        )}

        {/* Empty State */}
        {status === 'empty' && (
          <div className="discovery-empty-state">
            <OpenClawIcon size={28} className="discovery-empty-openclaw-icon" />
            <p>OpenClaw found no additional external resources for this topic.</p>
          </div>
        )}

        {/* Success Grid */}
        {status === 'success' && totalCount > 0 && (
          <div className="discovery-results-container">
            {/* Section: Web Search */}
            {(activeTab === 'all' || activeTab === 'web') && webList.length > 0 && (
              <div className="discovery-category-section">
                {activeTab === 'all' && (
                  <div className="discovery-section-label">
                    <Globe size={16} className="category-icon-web" />
                    <h4>Web Resources & Articles</h4>
                    <span className="section-badge">{webList.length}</span>
                  </div>
                )}
                <div className="discovery-cards-grid">
                  {webList.map((item) => (
                    <WebResourceCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Section: YouTube Videos */}
            {(activeTab === 'all' || activeTab === 'youtube') && youtubeList.length > 0 && (
              <div className="discovery-category-section">
                {activeTab === 'all' && (
                  <div className="discovery-section-label">
                    <Video size={16} className="category-icon-youtube" />
                    <h4>YouTube Video Lessons</h4>
                    <span className="section-badge">{youtubeList.length}</span>
                  </div>
                )}
                <div className="discovery-cards-grid youtube-grid">
                  {youtubeList.map((item) => (
                    <YouTubeResourceCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Section: Books & Guides */}
            {(activeTab === 'all' || activeTab === 'books') && booksList.length > 0 && (
              <div className="discovery-category-section">
                {activeTab === 'all' && (
                  <div className="discovery-section-label">
                    <BookOpen size={16} className="category-icon-book" />
                    <h4>Books & Textbooks</h4>
                    <span className="section-badge">{booksList.length}</span>
                  </div>
                )}
                <div className="discovery-cards-grid">
                  {booksList.map((item) => (
                    <BookResourceCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>

    {/* OpenClaw Ngrok Tunnel Configuration Modal */}
    <Modal
      isOpen={isConfigOpen}
      onClose={() => setIsConfigOpen(false)}
      title="OpenClaw Ngrok Tunnel Bridge"
      description="Connect this workspace to the OpenClaw crawler and search agent running on System B."
      size="md"
      footer={
        <div className="openclaw-modal-footer">
          <Button variant="ghost" size="sm" onClick={() => setIsConfigOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveTunnel}
            disabled={isTesting}
          >
            Save & Connect
          </Button>
        </div>
      }
    >
      <div className="openclaw-modal-body">
        <div className="openclaw-status-card">
          <div className="openclaw-status-header">
            <div className="openclaw-status-left">
              <Radio size={16} className="openclaw-radio-icon" />
              <span className="openclaw-status-title">Bridge Connection:</span>
            </div>
            <span
              className={`openclaw-health-chip ${
                healthStatus?.ok ? 'status-ok' : healthStatus ? 'status-err' : 'status-idle'
              }`}
            >
              {healthStatus?.ok ? 'Connected (System B)' : healthStatus ? 'Offline' : 'Ready'}
            </span>
          </div>
          {healthStatus?.message && (
            <p className="openclaw-status-detail">{healthStatus.message}</p>
          )}
        </div>

        <div className="openclaw-input-group">
          <label htmlFor="openclaw-url-input" className="openclaw-input-label">
            <Server size={14} />
            <span>Ngrok Forwarding URL (System B)</span>
          </label>
          <div className="openclaw-input-row">
            <input
              id="openclaw-url-input"
              type="url"
              placeholder="https://xxxx-xx-xx.ngrok-free.app"
              value={ngrokUrlInput}
              onChange={(e) => setNgrokUrlInput(e.target.value)}
              className="openclaw-input-field"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestTunnel}
              disabled={isTesting || !ngrokUrlInput.trim()}
            >
              {isTesting ? (
                <RefreshCw size={14} className="animate-spin mr-1" />
              ) : (
                <CheckCircle2 size={14} className="mr-1" />
              )}
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
          </div>
          <span className="openclaw-input-hint">
            Leave blank to use the built-in pedagogical resource repository.
          </span>
        </div>

        <div className="openclaw-instructions-box">
          <span className="instructions-title">How to connect System B (OpenClaw Host):</span>
          <ol className="instructions-list">
            <li>Start bridge server: <code>python3 scripts/openclaw_bridge_server.py</code></li>
            <li>Start Ngrok tunnel: <code>ngrok http 8000</code></li>
            <li>Paste your <code>https://...ngrok-free.app</code> forwarding URL above and click <strong>Test</strong>.</li>
          </ol>
        </div>
      </div>
    </Modal>
  </>
  );
};

/* ============================================================
   Individual Resource Cards
   ============================================================ */

/** Web Search Card */
const WebResourceCard: React.FC<{ item: LearningResource }> = ({ item }) => {
  const matchPct = item.relevanceScore ? Math.round(item.relevanceScore * 100) : 92;

  return (
    <div className="connector-card web-connector-card">
      <div className="connector-card-header">
        <div className="connector-domain-wrapper">
          <span className="connector-domain-badge">{item.source || 'Web Resource'}</span>
          <span className="connector-openclaw-pill" title="Extracted and ranked by OpenClaw">
            <OpenClawIcon size={11} />
            <span>OpenClaw</span>
          </span>
        </div>
        {matchPct && (
          <Badge variant="success" size="sm" className="connector-match-badge">
            {matchPct}% Match
          </Badge>
        )}
      </div>

      <h5 className="connector-card-title">{item.title}</h5>

      {item.description && (
        <p className="connector-card-description line-clamp-2">
          {item.description}
        </p>
      )}

      <div className="connector-card-footer">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="connector-action-button web-action-button"
            aria-label={`Open resource: ${item.title}`}
          >
            <span>Open Resource</span>
            <ExternalLink size={13} />
          </a>
        ) : (
          <span className="connector-text-muted">Reference</span>
        )}
      </div>
    </div>
  );
};

/** YouTube Card */
const YouTubeResourceCard: React.FC<{ item: LearningResource }> = ({ item }) => {
  const matchPct = item.relevanceScore ? Math.round(item.relevanceScore * 100) : 95;

  return (
    <div className="connector-card youtube-connector-card">
      <div className="youtube-thumb-wrapper">
        {item.thumbnail ? (
          <img
            src={item.thumbnail}
            alt={item.title}
            className="youtube-thumbnail"
            loading="lazy"
          />
        ) : (
          <div className="youtube-thumbnail-placeholder">
            <Video size={28} />
          </div>
        )}
        <div className="youtube-play-overlay">
          <Play size={20} fill="currentColor" />
        </div>
        {item.duration && (
          <span className="youtube-duration-badge">
            <Clock size={11} className="mr-0.5" />
            {item.duration}
          </span>
        )}
      </div>

      <div className="youtube-card-body">
        <div className="youtube-card-meta">
          <div className="connector-domain-wrapper">
            <span className="youtube-channel-name">{item.channelTitle || item.source || 'YouTube'}</span>
            <span className="connector-openclaw-pill" title="Extracted and ranked by OpenClaw">
              <OpenClawIcon size={11} />
              <span>OpenClaw</span>
            </span>
          </div>
          {matchPct && (
            <Badge variant="success" size="sm">
              {matchPct}% Match
            </Badge>
          )}
        </div>

        <h5 className="connector-card-title youtube-title line-clamp-2">{item.title}</h5>

        {item.description && (
          <p className="connector-card-description line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="connector-card-footer">
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="connector-action-button youtube-action-button"
              aria-label={`Watch video: ${item.title}`}
            >
              <Play size={12} fill="currentColor" />
              <span>Watch Video</span>
              <ExternalLink size={13} />
            </a>
          ) : (
            <span className="connector-text-muted">Video</span>
          )}
        </div>
      </div>
    </div>
  );
};

/** Book Card */
const BookResourceCard: React.FC<{ item: LearningResource }> = ({ item }) => {
  return (
    <div className="connector-card book-connector-card">
      <div className="book-card-top">
        <div className="book-icon-wrapper">
          <BookOpen size={20} className="book-card-icon" />
        </div>
        <div className="book-card-info">
          <div className="connector-domain-wrapper">
            <span className="book-author-badge">{item.source || 'Textbook'}</span>
            <span className="connector-openclaw-pill" title="Extracted and indexed by OpenClaw">
              <OpenClawIcon size={11} />
              <span>OpenClaw</span>
            </span>
          </div>
          <h5 className="connector-card-title book-title">{item.title}</h5>
        </div>
      </div>

      {item.description && (
        <p className="connector-card-description line-clamp-2">
          {item.description}
        </p>
      )}

      <div className="connector-card-footer">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="connector-action-button book-action-button"
            aria-label={`Read reference: ${item.title}`}
          >
            <span>Read Reference</span>
            <ExternalLink size={13} />
          </a>
        ) : (
          <span className="connector-text-muted">Textbook Reference</span>
        )}
      </div>
    </div>
  );
};

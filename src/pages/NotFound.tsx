import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Compass, Home } from 'lucide-react';
import './NotFound.css';

export const NotFound: React.FC = () => {
  return (
    <div className="not-found-page animate-fade-in">
      <Card variant="glass" className="not-found-card">
        <div className="not-found-icon">
          <Compass size={48} />
        </div>
        <span className="not-found-code">404</span>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-text">
          The requested learning route doesn't exist or has moved. Let's get you back to your learning workspace.
        </p>
        <div className="not-found-actions">
          <Link to="/student">
            <Button variant="primary" size="md">
              <Home size={16} /> Return to Learning Workspace
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

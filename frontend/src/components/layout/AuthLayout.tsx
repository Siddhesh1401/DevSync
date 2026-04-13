import React from 'react';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">DevSync</h1>
          {title && <h2 className="auth-title">{title}</h2>}
        </div>
        <div className="auth-content">
          {children}
        </div>
        <div className="auth-footer">
          <p className="auth-footer-text">
            © 2026 DevSync. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

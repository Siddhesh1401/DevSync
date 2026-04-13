import Header from '../components/layout/Header';
import './ComingSoon.css';

const ComingSoon = () => {
  return (
    <div className="cs-page">
      <Header />

      <main className="cs-main">
        {/* Background decoration */}
        <div className="cs-bg-blob cs-bg-blob--1" aria-hidden="true" />
        <div className="cs-bg-blob cs-bg-blob--2" aria-hidden="true" />
        <div className="cs-bg-grid" aria-hidden="true" />

        <div className="container cs-content animate-fadeIn">
          {/* Badge */}
          <div className="cs-badge">
            <span className="cs-badge__dot" />
            Phase 1 — Engineering Foundation
          </div>

          {/* Headline */}
          <h1 className="cs-title">
            Team coordination,
            <br />
            <span className="cs-title--gradient">built for developers.</span>
          </h1>

          <p className="cs-subtitle">
            DevSync replaces scattered WhatsApp messages with a professional
            GitHub-integrated workspace. Get notified instantly, discuss PRs
            in-app, and track work — all in one place.
          </p>

          {/* Feature pills */}
          <div className="cs-features">
            {[
              { icon: '🔔', label: 'Instant PR notifications' },
              { icon: '💬', label: 'In-app PR discussions' },
              { icon: '📋', label: 'Lightweight task board' },
              { icon: '📊', label: 'Full activity feed' },
              { icon: '🔗', label: 'GitHub integrated' },
              { icon: '📧', label: 'Email alerts' },
            ].map(({ icon, label }) => (
              <div key={label} className="cs-feature-pill">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Status card */}
          <div className="cs-status-card">
            <div className="cs-status-card__header">
              <span className="cs-status-card__title">Build Progress</span>
              <span className="cs-status-card__phase">Phase 1 of 8</span>
            </div>

            <div className="cs-phases">
              {[
                { label: 'Engineering Foundation', status: 'active', phase: 1 },
                { label: 'Auth & Team Management', status: 'upcoming', phase: 2 },
                { label: 'GitHub Integration', status: 'upcoming', phase: 3 },
                { label: 'Email Notifications', status: 'upcoming', phase: 4 },
                { label: 'Core Product', status: 'upcoming', phase: 5 },
                { label: 'Real-time', status: 'upcoming', phase: 6 },
                { label: 'Security & Testing', status: 'upcoming', phase: 7 },
                { label: 'Launch 🎉', status: 'upcoming', phase: 8 },
              ].map(({ label, status, phase }) => (
                <div key={phase} className={`cs-phase cs-phase--${status}`}>
                  <div className="cs-phase__dot" />
                  <div className="cs-phase__info">
                    <span className="cs-phase__num">Phase {phase}</span>
                    <span className="cs-phase__label">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="cs-footer-note">
            Infrastructure is being set up. The full DevSync platform is coming soon. 🚀
          </p>
        </div>
      </main>
    </div>
  );
};

export default ComingSoon;

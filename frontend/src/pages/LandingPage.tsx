import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

export const LandingPage: React.FC = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-container">
          <div className="nav-logo">DevSync</div>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/signup" className="nav-link cta">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="landing-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Simplify Team Coordination
            </h1>
            <p className="hero-subtitle">
              All your GitHub pull requests, notifications, and team communication in one place. Say goodbye to scattered WhatsApp threads.
            </p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary">Get Started Free</Link>
              <Link to="/login" className="btn btn-secondary">Already have an account?</Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-placeholder">
              <div className="illustration-box">
                📊
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="landing-container">
          <h2 className="section-title">Why DevSync?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Real-Time Notifications</h3>
              <p>Get instant email alerts when PRs are created, merged, or updated. Never miss an important event again.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Centralized Communication</h3>
              <p>Discuss PRs and tasks in one place. Say goodbye to scattered chat messages and missing context.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🐙</div>
              <h3>GitHub Integrated</h3>
              <p>Connect your GitHub repositories with a simple webhook. DevSync syncs all your PR data automatically.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Task Management</h3>
              <p>Create and assign tasks to team members. Track progress with our simple Kanban board.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Team Collaboration</h3>
              <p>Invite team members, set roles, and collaborate seamlessly on projects.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Activity Feed</h3>
              <p>See all team activity in one timeline. Know who did what and when at a glance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="landing-container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your account and set up your team</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Connect GitHub</h3>
              <p>Link your GitHub repos with a webhook</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Start Collaborating</h3>
              <p>Get notifications and discuss PRs in DevSync</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq">
        <div className="landing-container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Is DevSync free?</h4>
              <p>Yes! DevSync is free for teams. We offer a generous free tier with unlimited repositories and team members.</p>
            </div>
            <div className="faq-item">
              <h4>How do I connect GitHub?</h4>
              <p>It's easy! In your DevSync team settings, follow a 4-step wizard to add a webhook to your GitHub repo. Takes less than 2 minutes.</p>
            </div>
            <div className="faq-item">
              <h4>Can I use DevSync with multiple repos?</h4>
              <p>Absolutely! You can connect as many GitHub repositories as you want to your DevSync team.</p>
            </div>
            <div className="faq-item">
              <h4>What if I forget my password?</h4>
              <p>No problem! Click "Forgot Password" on the login page and we'll send you a reset link via email.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="landing-container">
          <h2>Ready to simplify your team coordination?</h2>
          <p>Join teams already using DevSync to streamline their workflow.</p>
          <Link to="/signup" className="btn btn-primary btn-large">Get Started Now</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>DevSync</h4>
              <p>Team coordination made simple</p>
            </div>
            <div className="footer-section">
              <h4>Links</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms & Conditions</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 DevSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

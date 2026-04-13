import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="8" fill="url(#logo-gradient)" />
            <path
              d="M8 14h4m4 0h4M14 8v4m0 4v4"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" />
                <stop offset="1" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <span className="header__brand">DevSync</span>
        </Link>

        <nav className="header__nav" aria-label="Main navigation">
          {/* Phase 2: These will link to real pages */}
          <a href="#features" className="header__nav-link">Features</a>
          <a href="#how-it-works" className="header__nav-link">How It Works</a>
        </nav>

        <div className="header__actions">
          {/* Phase 2: These link to /login and /signup */}
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

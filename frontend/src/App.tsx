import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Phase 2 — Dashboard & Profile
import { Dashboard } from './pages/dashboard/Dashboard';
import { ProfilePage } from './pages/ProfilePage';

// Phase 3 — GitHub Integration
import { ReposPage } from './pages/repos/ReposPage';
import { PRListPage } from './pages/prs/PRListPage';
import { PRDetailPage } from './pages/prs/PRDetailPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ── Protected (Phase 2) ── */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* ── Protected (Phase 3) ── */}
          <Route path="/dashboard/repos"     element={<ProtectedRoute><ReposPage /></ProtectedRoute>} />
          <Route path="/dashboard/prs"       element={<ProtectedRoute><PRListPage /></ProtectedRoute>} />
          <Route path="/dashboard/prs/:id"   element={<ProtectedRoute><PRDetailPage /></ProtectedRoute>} />

          {/* ── Catch-all ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

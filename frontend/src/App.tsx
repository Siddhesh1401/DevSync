import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ComingSoon from './pages/ComingSoon';

// Phase 2 pages will be imported here:
// import LandingPage from './pages/LandingPage';
// import LoginPage from './pages/auth/LoginPage';
// import SignupPage from './pages/auth/SignupPage';
// import Dashboard from './pages/dashboard/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Phase 1: Placeholder */}
        <Route path="/" element={<ComingSoon />} />

        {/* Phase 2: Auth routes (uncomment when built) */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/signup" element={<SignupPage />} /> */}
        {/* <Route path="/verify-email" element={<VerifyEmailPage />} /> */}
        {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}

        {/* Phase 2: Protected dashboard routes */}
        {/* <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}

        {/* Catch-all: redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

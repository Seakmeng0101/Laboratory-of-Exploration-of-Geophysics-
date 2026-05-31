import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/home.pages';
import AboutUs from './pages/about_us/team.abous_us';
import Login from './pages/auth/login.auth';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Only allows access if pendingEmail exists (set after login)
const ProtectedOtp = () => {
  const pendingEmail = localStorage.getItem('pendingEmail');
  return pendingEmail ? <VerifyOtp /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Auth pages — no Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<ProtectedOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Public pages — with Navbar */}
        <Route path="/*" element={
          <>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about/our-team" element={<AboutUs />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
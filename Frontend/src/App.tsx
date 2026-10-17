import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import GlobalStyles from './components/GlobalStyles';
import Home from './pages/home.pages';
import AboutUs from './pages/about_us/team.abous_us';
import Login from './pages/auth/login.auth';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import EquipmentPage from './pages/about_us/Equipment';
import ServicesPage from './pages/services/Services';
import ContactPage from './pages/Contacts/ContactPage';
import ProjectPage from './pages/ProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import { getMe } from './api/auth.api';
import VisionMissionPage from './pages/about_us/VisionMissionPage';


// Only allows access if pendingEmail exists (set after login)
const ProtectedOtp = () => {
  const pendingEmail = sessionStorage.getItem('pendingEmail');
  return pendingEmail ? <VerifyOtp /> : <Navigate to="/login" replace />;
};

// Open every new page at the top
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// On page load/refresh: if a token exists, check it.
// An invalid token -> the interceptor tries refresh -> if that fails, goes to /login.
const SessionCheck = () => {
  useEffect(() => {
    if (sessionStorage.getItem('accessToken')) {
      getMe().catch(() => {});
    }
  }, []);
  return null;
};

function App() {
  return (
    <>
      <GlobalStyles />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <ScrollToTop />
        <SessionCheck />
        <Routes>
          {/* Auth pages: no Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<ProtectedOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Public pages: with Navbar */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about/our-team" element={<AboutUs />} />
                  <Route path="/about/equipment" element={<EquipmentPage />} />
                  <Route path="/about/vision-mission" element={<VisionMissionPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/contact/messages" element={<Navigate to="/contact" replace />} />
                  <Route path="/contact/team" element={<Navigate to="/contact" replace />} />
                  <Route path="/projects" element={<ProjectPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
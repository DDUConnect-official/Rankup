import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import ProfileDetails from "./pages/ProfileDetails";
import Levels from "./pages/Levels";
import LevelContent from "./pages/LevelContent";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import AuthLayout from "./layouts/AuthLayout";
import ProfileLayout from "./layouts/ProfileLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Loader from "./components/Loader";

// ... existing imports

function App() {
  const { loading } = useAuth();

  // Show loading screen while Firebase determines auth state
  if (loading) {
    return <Loader text="Starting RankUp..." fullScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* -------- Auth (Blue Hue) -------- */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* -------- Profile Setup (Orange Hue) -------- */}
        <Route
          element={
            <ProtectedRoute>
              <ProfileLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/profile-setup" element={<ProfileSetup />} />
        </Route>

        {/* -------- Dashboard (Hue 225) -------- */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfileDetails />} />
          <Route path="/levels/:moduleId" element={<Levels />} />
          <Route path="/level/:levelId" element={<LevelContent />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Statistics from "./pages/Statistics";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Layout from "./components/layout/Layout";
import theme from "./theme/theme";
import "./i18n";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/statistics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Statistics /> {/* Use the Statistics component */}
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    {/* Will implement Settings page later */}
                    <div>Settings Page (Coming Soon)</div>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/transaction/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    {/* Will implement New Transaction page later */}
                    <div>Add Transaction (Coming Soon)</div>
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/transaction/edit/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    {/* Will implement Edit Transaction page later */}
                    <div>Edit Transaction (Coming Soon)</div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            {/* Default route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

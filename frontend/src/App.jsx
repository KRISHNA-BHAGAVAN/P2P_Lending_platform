import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { IoNotifications } from 'react-icons/io5';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { API_BASE_URL } from './config/api';
import BorrowerDashboard from './components/dashboard/BorrowerDashboard';
import LenderDashboard from './components/dashboard/LenderDashboard';
import NotificationCenter from './components/notifications/NotificationCenter';
import ProfileSidebar from './components/common/ProfileSidebar';
import ViewProfile from './components/profile/ViewProfile';
import EditProfile from './components/profile/EditProfile';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-gray-700 truncate">
                <span className="hidden sm:inline">P2P Lending Platform</span>
                <span className="sm:hidden">P2P Lending</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-700 hidden xs:inline">
                Welcome, {user?.firstName}
              </span>
              <Link
                to="/notifications"
                className="text-gray-500 hover:text-gray-700 relative p-1"
              >
                <IoNotifications size={18} className="sm:w-5 sm:h-5" />
              </Link>
              <button
                onClick={() => setShowProfileSidebar(true)}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold hover:shadow-lg transition-all duration-200"
              >
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `${API_BASE_URL}${user.profilePicture}`}  
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user?.firstName?.charAt(0)?.toUpperCase()
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Routes>
          <Route 
            path="/dashboard" 
            element={
              user?.role === 'borrower' ? <BorrowerDashboard /> : <LenderDashboard />
            } 
          />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/profile" element={<ViewProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>

      {/* Profile Sidebar */}
      <ProfileSidebar 
        isOpen={showProfileSidebar} 
        onClose={() => setShowProfileSidebar(false)} 
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } 
          />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
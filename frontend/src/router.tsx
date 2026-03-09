import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import NewProjectPage from './pages/NewProjectPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import MarketplacePage from './pages/MarketplacePage'
import ProfilePage from './pages/ProfilePage'
import LoadingSpinner from './components/LoadingSpinner'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

const AppRouter: React.FC = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/projects/new"
        element={
          <ProtectedRoute>
            <NewProjectPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/marketplace"
        element={
          <ProtectedRoute>
            <MarketplacePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default AppRouter
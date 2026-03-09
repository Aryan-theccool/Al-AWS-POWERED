import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Plus, FolderOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                ClarityBridge
              </h1>
            </div>
            
            <nav className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              {user?.userType === 'developer' && (
                <Link
                  to="/marketplace"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Marketplace
                </Link>
              )}
              <Link
                to="/profile"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
              <button
                onClick={signOut}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.profile.firstName || 'User'}!
          </h2>
          <p className="text-gray-600">
            {user?.userType === 'client' 
              ? 'Manage your projects and find the perfect developer for your next idea.'
              : 'Discover new projects and grow your freelance business.'
            }
          </p>
        </div>

        {/* Quick Actions */}
        {user?.userType === 'client' && (
          <div className="mb-8">
            <Link
              to="/projects/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Project
            </Link>
          </div>
        )}

        {/* Projects Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {user?.userType === 'client' ? 'Your Projects' : 'Active Projects'}
            </h3>
          </div>
          
          <div className="p-6">
            {/* Empty State */}
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No projects yet
              </h4>
              <p className="text-gray-600 mb-6">
                {user?.userType === 'client' 
                  ? 'Create your first project to get started with AI-powered requirement analysis.'
                  : 'Browse the marketplace to find exciting projects to work on.'
                }
              </p>
              {user?.userType === 'client' ? (
                <Link
                  to="/projects/new"
                  className="btn-primary"
                >
                  Create Your First Project
                </Link>
              ) : (
                <Link
                  to="/marketplace"
                  className="btn-primary"
                >
                  Browse Marketplace
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Plus, FolderOpen, Clock, DollarSign, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

interface Project {
  projectId: string
  title: string
  description: string
  status: string
  budget?: { min: number; max: number; currency: string }
  timeline?: { estimatedWeeks: number; flexibility: string }
  createdAt: string
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  active: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const result: any = await api.getProjects()
      setProjects(result?.data?.projects || result?.projects || [])
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">ClarityBridge</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
              {user?.userType?.toLowerCase() === 'developer' && (
                <Link to="/marketplace" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Marketplace</Link>
              )}
              <Link to="/profile" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Profile</Link>
              <button onClick={signOut} className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Sign Out</button>
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
            {user?.userType?.toLowerCase() === 'client'
              ? 'Manage your projects and find the perfect developer for your next idea.'
              : 'Discover new projects and grow your freelance business.'}
          </p>
        </div>

        {/* Quick Actions */}
        {user?.userType?.toLowerCase() === 'client' && (
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
              {user?.userType?.toLowerCase() === 'client' ? 'Your Projects' : 'Active Projects'}
            </h3>
          </div>

          <div className="p-6">
            {isLoading ? (
              /* Loading skeleton */
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : projects.length > 0 ? (
              /* Project cards */
              <div className="space-y-4">
                {projects.map(project => (
                  <Link
                    key={project.projectId}
                    to={`/projects/${project.projectId}`}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-150"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{project.title}</h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[project.status] || statusColors.draft}`}>
                          {project.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate mb-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {project.budget && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {project.budget.min}–{project.budget.max} {project.budget.currency}
                          </span>
                        )}
                        {project.timeline && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {project.timeline.estimatedWeeks} weeks
                          </span>
                        )}
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h4>
                <p className="text-gray-600 mb-6">
                {user?.userType?.toLowerCase() === 'client'
                    ? 'Create your first project to get started with AI-powered requirement analysis.'
                    : 'Browse the marketplace to find exciting projects to work on.'}
                </p>
                {user?.userType?.toLowerCase() === 'client' ? (
                  <Link to="/projects/new" className="btn-primary">Create Your First Project</Link>
                ) : (
                  <Link to="/marketplace" className="btn-primary">Browse Marketplace</Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
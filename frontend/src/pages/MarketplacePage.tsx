import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { FolderOpen, Clock, DollarSign, ChevronRight, ArrowLeft } from 'lucide-react'
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

const MarketplacePage: React.FC = () => {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchActiveProjects()
  }, [])

  const fetchActiveProjects = async () => {
    try {
      const result: any = await api.listActiveProjects()
      setProjects(result?.data?.projects || result?.projects || [])
    } catch (err) {
      console.error('Failed to load marketplace projects:', err)
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
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
              <span className="text-gray-300">/</span>
              <h1 className="text-lg font-semibold text-gray-900">Project Marketplace</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
              <Link to="/profile" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Profile</Link>
              <button onClick={signOut} className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Sign Out</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Projects</h2>
          <p className="text-gray-600">Browse active projects and submit your proposals.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-lg" />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map(project => (
                  <Link
                    key={project.projectId}
                    to={`/projects/${project.projectId}`}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-150"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-base font-semibold text-gray-900 truncate">{project.title}</h4>
                      </div>
                      <p className="text-sm text-gray-500 truncate mb-3">{project.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {project.budget && (
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <DollarSign className="h-4 w-4" />
                            {project.budget.min}–{project.budget.max} {project.budget.currency}
                          </span>
                        )}
                        {project.timeline && (
                          <span className="flex items-center gap-1 font-medium text-gray-700">
                            <Clock className="h-4 w-4" />
                            {project.timeline.estimatedWeeks} weeks
                          </span>
                        )}
                        <span className="text-gray-400">Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No active projects</h4>
                <p className="text-gray-600">Check back later for new opportunities.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default MarketplacePage
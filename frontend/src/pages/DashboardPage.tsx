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
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600">
                ClarityBridge
              </h1>
            </div>
            <nav className="flex items-center space-x-2">
              <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors">Dashboard</Link>
              {user?.userType?.toLowerCase() === 'developer' && (
                <Link to="/marketplace" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors">Marketplace</Link>
              )}
              <Link to="/profile" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors">Profile</Link>
              <button onClick={signOut} className="text-gray-600 hover:text-red-500 px-3 py-2 rounded-xl text-sm font-medium transition-colors">Sign Out</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="mb-10 p-8 rounded-3xl bg-gradient-to-br from-primary-50 to-indigo-50 border border-primary-100/50">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Welcome back, <span className="text-primary-600">{user?.profile.firstName || 'User'}</span>!
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
            {user?.userType?.toLowerCase() === 'client'
              ? 'Ready to bring your next big idea to life? Our AI Design Partner is here to help you refine your requirements.'
              : 'Discover curated high-value projects that match your expertise and grow your independent career.'}
          </p>
          
          {user?.userType?.toLowerCase() === 'client' && (
            <div className="mt-6">
              <Link
                to="/projects/new"
                className="btn-premium inline-flex py-3 px-8 text-lg"
              >
                <Plus className="h-5 w-5" />
                Start New Project
              </Link>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary-500" />
              {user?.userType?.toLowerCase() === 'client' ? 'Your Active Projects' : 'Recommended Projects'}
            </h3>
            <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
              {projects.length} Total
            </span>
          </div>

          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse h-40 bg-gray-100 rounded-2xl" />
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map(project => (
                  <Link
                    key={project.projectId}
                    to={`/projects/${project.projectId}`}
                    className="glass-card group p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${statusColors[project.status] || statusColors.draft}`}>
                          {project.status.replace('_', ' ')}
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-500 transform group-hover:translateX-1 transition-all" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                        {project.title}
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                        {project.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
                      <div className="flex items-center gap-4">
                        {project.budget && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span>${project.budget.max.toLocaleString()}</span>
                          </div>
                        )}
                        {project.timeline && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>{project.timeline.estimatedWeeks}w</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Ref {project.projectId.slice(0, 6)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 glass-card float-animation">
                <div className="bg-primary-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FolderOpen className="h-10 w-10 text-primary-400" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2 italic">Nothing found yet</h4>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                {user?.userType?.toLowerCase() === 'client'
                    ? "You haven't posted any projects. Let's make your first one today!"
                    : "The marketplace is quiet. Check back later for new high-value opportunities."}
                </p>
                {user?.userType?.toLowerCase() === 'client' ? (
                  <Link to="/projects/new" className="btn-premium inline-flex px-8">Create Project</Link>
                ) : (
                  <Link to="/marketplace" className="btn-premium inline-flex px-8">Explore All</Link>
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
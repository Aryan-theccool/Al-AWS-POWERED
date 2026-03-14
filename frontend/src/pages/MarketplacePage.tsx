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
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/dashboard')} 
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600">
                Marketplace
              </h1>
            </div>
            <nav className="flex items-center space-x-2">
              <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors">Dashboard</Link>
              <Link to="/profile" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors">Profile</Link>
              <button onClick={signOut} className="text-gray-600 hover:text-red-500 px-3 py-2 rounded-xl text-sm font-medium transition-colors">Sign Out</button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Available Opportunities</h2>
          <p className="text-gray-600 text-lg">Browse curated projects and showcase your expertise with high-quality proposals.</p>
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
                      <div className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-primary-50 text-primary-700">
                        {project.status}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary-500 transform group-hover:translate-x-1 transition-all" />
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
                      Posted {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 glass-card float-animation">
              <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="h-10 w-10 text-gray-300" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2 italic">No active projects</h4>
              <p className="text-gray-500 mb-8 max-w-sm mx-auto">Check back later for new high-value opportunities matching your skills.</p>
              <Link to="/dashboard" className="btn-premium inline-flex px-8">Return to Dashboard</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default MarketplacePage
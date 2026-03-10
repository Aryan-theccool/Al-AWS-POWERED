import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, DollarSign, Clock, Calendar, Tag } from 'lucide-react'
import { api } from '../services/api'

interface Project {
  projectId: string
  clientId: string
  title: string
  description: string
  status: string
  budget?: { min: number; max: number; currency: string }
  timeline?: { estimatedWeeks: number; flexibility: string }
  createdAt: string
  updatedAt: string
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  active: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
}

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) fetchProject(projectId)
  }, [projectId])

  const fetchProject = async (id: string) => {
    try {
      const result: any = await api.getProject(id)
      setProject(result?.data?.project || result?.project || null)
    } catch (err: any) {
      setError(err?.message || 'Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <span className="text-gray-300">/</span>
            <h1 className="text-lg font-semibold text-gray-900 truncate">{project.title}</h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title & Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[project.status] || statusColors.draft}`}>
              {project.status}
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed">{project.description}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Budget */}
          {project.budget && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 text-gray-500 mb-3">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-wide">Budget</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {project.budget.min.toLocaleString()} – {project.budget.max.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">{project.budget.currency}</p>
            </div>
          )}

          {/* Timeline */}
          {project.timeline && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 text-gray-500 mb-3">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-wide">Timeline</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{project.timeline.estimatedWeeks} weeks</p>
              <p className="text-sm text-gray-500 mt-1 capitalize">{project.timeline.flexibility}</p>
            </div>
          )}

          {/* Created */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-wide">Created</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <Tag className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-wide">Status</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 capitalize">{project.status}</p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated {new Date(project.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link to="/dashboard" className="btn-secondary">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}

export default ProjectDetailPage
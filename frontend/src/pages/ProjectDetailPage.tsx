import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, DollarSign, Clock, Calendar, Tag, ChevronDown, Briefcase, Send, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import toast from 'react-hot-toast'

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

interface Proposal {
  proposalId: string
  projectId: string
  developerId: string
  timeline: number
  budget: number
  approach: string
  status: string
  submittedAt: string
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
  const { user, userId } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Proposal form state
  const [proposalForm, setProposalForm] = useState({
    approach: '',
    budget: '',
    timeline: '',
  })

  useEffect(() => {
    if (projectId) fetchProject(projectId)
  }, [projectId])

  const fetchProject = async (id: string) => {
    try {
      setIsLoading(true)
      const result: any = await api.getProject(id)
      const projectData = result?.data?.project || result?.project || null
      setProject(projectData)

      if (projectData) {
        // If client owner, fetch all proposals
        if (projectData.clientId === userId || user?.userType?.toLowerCase() === 'client') {
          try {
            const proposalResult: any = await api.getProposals(id)
            setProposals(proposalResult?.data?.proposals || proposalResult?.proposals || [])
          } catch (pErr) {
            console.error('Failed to load proposals:', pErr)
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!projectId || !project) return
    setIsUpdating(true)
    try {
      const result: any = await api.updateProject(projectId, { status: newStatus })
      setProject(result?.data?.project || result?.project || null)
      toast.success('Status updated successfully')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!projectId) return
    
    setIsSubmittingProposal(true)
    try {
      await api.createProposal(projectId, {
        approach: proposalForm.approach,
        budget: Number(proposalForm.budget),
        timeline: Number(proposalForm.timeline),
      })
      toast.success('Proposal submitted successfully!')
      setProposalForm({ approach: '', budget: '', timeline: '' })
      // Re-fetch to update state
      fetchProject(projectId)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit proposal')
    } finally {
      setIsSubmittingProposal(false)
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
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[project.status] || statusColors.draft}`}>
                <Tag className="h-4 w-4 mr-2" />
                <span className="capitalize">{project.status}</span>
              </div>
              
              {user?.userType === 'client' && project.clientId === userId && (
                <div className="relative group">
                  <button
                    disabled={isUpdating}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 overflow-hidden">
                    {Object.keys(statusColors).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 capitalize transition-colors"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
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

          {/* Updated */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-wide">Last Updated</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(project.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Proposals Section */}
        {user?.userType === 'client' && project.clientId === userId ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary-600" />
              Received Proposals ({proposals.length})
            </h3>
            
            {proposals.length > 0 ? (
              <div className="space-y-6">
                {proposals.map((proposal) => (
                  <div key={proposal.proposalId} className="border border-gray-100 rounded-xl p-5 hover:border-primary-100 hover:bg-primary-50/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 border-b border-dashed border-gray-200 pb-0.5 mb-1">
                            Developer ID: {proposal.developerId.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            Submitted on {new Date(proposal.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${proposal.budget.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{proposal.timeline} days estimated</p>
                      </div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap italic">
                      "{proposal.approach}"
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm font-medium">No proposals yet</p>
                <p className="text-xs text-gray-400 mt-1">Wait for developers to reach out.</p>
              </div>
            )}
          </div>
        ) : user?.userType?.toLowerCase() === 'developer' && project.status === 'active' ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Send className="h-5 w-5 text-primary-600" />
              Submit Your Proposal
            </h3>
            
            <form onSubmit={handleProposalSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Budget (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      required
                      placeholder="e.g. 5000"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={proposalForm.budget}
                      onChange={(e) => setProposalForm({ ...proposalForm, budget: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Timeline (Days)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      required
                      placeholder="e.g. 14"
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={proposalForm.timeline}
                      onChange={(e) => setProposalForm({ ...proposalForm, timeline: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Approach & Experience</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe how you will tackle this project and why you are the best fit..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  value={proposalForm.approach}
                  onChange={(e) => setProposalForm({ ...proposalForm, approach: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingProposal}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50"
              >
                {isSubmittingProposal ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Submit Proposal
              </button>
            </form>
          </div>
        ) : null}

        <div className="flex gap-3 pt-4">
          <Link to="/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}

export default ProjectDetailPage
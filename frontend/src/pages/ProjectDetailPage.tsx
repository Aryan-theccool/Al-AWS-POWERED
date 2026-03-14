import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, DollarSign, Clock, Calendar, ChevronDown, Briefcase, Send, User, Sparkles } from 'lucide-react'
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
  const [isAnalyzingProposal, setIsAnalyzingProposal] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [proposalAnalysis, setProposalAnalysis] = useState<Record<string, any>>({})

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

  const handleAnalyzeProposal = async (proposalId: string) => {
    if (!projectId) return
    
    setIsAnalyzingProposal(proposalId)
    try {
      const result: any = await api.analyzeProposal(projectId, proposalId)
      const feedback = result?.data?.feedback || result?.feedback
      if (feedback) {
        setProposalAnalysis(prev => ({
          ...prev,
          [proposalId]: feedback
        }))
        toast.success('AI Analysis complete!')
      }
    } catch (err: any) {
      toast.error(err?.message || 'AI Analysis failed')
    } finally {
      setIsAnalyzingProposal(null)
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
    <div className="min-h-screen pb-20">
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
                Project Detail
              </h1>
            </div>
            <nav className="flex items-center space-x-2">
              <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors">Dashboard</Link>
              <Link to="/profile" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors">Profile</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Project Header Card */}
        <div className="glass-card p-8 mb-8 border-l-4 border-l-primary-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${statusColors[project.status] || statusColors.draft}`}>
                  {project.status.replace('_', ' ')}
                </span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  ID: {project.projectId.slice(0, 8)}
                </span>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">{project.title}</h2>
            </div>

            {user?.userType?.toLowerCase() === 'client' && project.clientId === userId && (
              <div className="relative inline-block w-full md:w-auto">
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdating}
                  className="appearance-none w-full md:w-48 bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all"
                >
                  <option value="draft">Review Draft</option>
                  <option value="active">Publish to Marketplace</option>
                  <option value="in_progress">Mark In Progress</option>
                  <option value="completed">Mark Completed</option>
                  <option value="cancelled">Archive Project</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>

          <div className="prose prose-indigo max-w-none">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Project Description</h4>
            <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap bg-gray-50/50 p-6 rounded-2xl border border-gray-100/50">
              {project.description}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {project.budget && (
            <div className="glass-card p-6 border-t-4 border-t-green-500/50">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Allocated Budget</span>
              </div>
              <p className="text-2xl font-black text-gray-900">
                ${project.budget.min.toLocaleString()} – ${project.budget.max.toLocaleString()}
              </p>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter">{project.budget.currency} FIXED-RANGE</p>
            </div>
          )}

          {project.timeline && (
            <div className="glass-card p-6 border-t-4 border-t-blue-500/50">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Expected Timeline</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{project.timeline.estimatedWeeks} Success Weeks</p>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tighter capitalize">{project.timeline.flexibility} DELIVERY</p>
            </div>
          )}
        </div>

        {/* Proposals Section */}
        {user?.userType?.toLowerCase() === 'client' && project.clientId === userId ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-primary-500" />
                Expert Proposals ({proposals.length})
              </h3>
            </div>
            
            {proposals.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {proposals.map((proposal) => (
                  <div key={proposal.proposalId} className="glass-card p-6 flex flex-col gap-6 relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                              <User className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 uppercase tracking-tight">
                                Expert ID: {proposal.developerId.slice(0, 8)}
                              </p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                Submitted {new Date(proposal.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleAnalyzeProposal(proposal.proposalId)}
                            disabled={!!isAnalyzingProposal}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                              proposalAnalysis[proposal.proposalId] 
                                ? 'bg-green-50 text-green-600 border border-green-100'
                                : 'bg-primary-50 text-primary-600 hover:bg-primary-100 hover:shadow-md border border-primary-100'
                            }`}
                          >
                            {isAnalyzingProposal === proposal.proposalId ? (
                              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : <Sparkles className="h-3 w-3" />}
                            AI Insights
                          </button>
                        </div>
                        <div className="bg-white/40 p-5 rounded-2xl border border-white/60 text-gray-700 text-sm leading-relaxed italic mb-4">
                          "{proposal.approach}"
                        </div>
                      </div>
                      <div className="md:w-48 flex md:flex-col justify-between md:justify-center items-center md:border-l border-gray-100 md:pl-6 text-center">
                        <div>
                          <p className="text-2xl font-black text-primary-600">${proposal.budget.toLocaleString()}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{proposal.timeline} Days ETA</p>
                        </div>
                        <button className="mt-4 text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest px-4 py-2 bg-primary-50 rounded-xl transition-colors">
                          View Profile
                        </button>
                      </div>
                    </div>

                    {/* AI Analysis Result */}
                    {proposalAnalysis[proposal.proposalId] && (
                      <div className="mt-4 pt-6 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center">
                            <Sparkles className="h-3 w-3 text-primary-600" />
                          </div>
                          <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest">Intelligent Proposal Evaluation</span>
                          <div className="ml-auto px-3 py-1 bg-primary-600 text-white rounded-full text-[10px] font-black tracking-widest">
                            {proposalAnalysis[proposal.proposalId].matchScore}% MATCH
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Executive Summary</p>
                              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                                {proposalAnalysis[proposal.proposalId].executiveSummary}
                              </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Verdict</p>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    proposalAnalysis[proposal.proposalId].verdict === 'Strong Match' 
                                        ? 'bg-green-100 text-green-700 border-green-200' 
                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                }`}>
                                    {proposalAnalysis[proposal.proposalId].verdict}
                                </span>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100/50">
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-2">Key Strengths</p>
                                <ul className="space-y-2">
                                  {proposalAnalysis[proposal.proposalId].strengths.map((s: string, i: number) => (
                                    <li key={i} className="text-[11px] text-gray-600 flex items-start gap-2">
                                      <span className="text-green-500 font-bold">•</span> {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">Concerns/Gaps</p>
                                <ul className="space-y-2">
                                  {proposalAnalysis[proposal.proposalId].concerns.map((c: string, i: number) => (
                                    <li key={i} className="text-[11px] text-gray-600 flex items-start gap-2">
                                      <span className="text-amber-500 font-bold">•</span> {c}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 glass-card bg-gray-50/30 border-dashed border-2">
                <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-gray-400 italic">Awaiting Experts</h4>
                <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">Your project is visible to top-tier talent</p>
              </div>
            )}
          </div>
        ) : user?.userType?.toLowerCase() === 'developer' && project.status === 'active' ? (
          <div className="glass-card p-8 border-t-4 border-t-primary-500">
            <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Send className="h-5 w-5 text-primary-500" />
              Secure This Project
            </h3>
            
            <form onSubmit={handleProposalSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Strategy & Approach</label>
                <textarea
                  required
                  rows={6}
                  value={proposalForm.approach}
                  onChange={(e) => setProposalForm({ ...proposalForm, approach: e.target.value })}
                  placeholder="Detail your specialized approach to this project..."
                  className="w-full bg-white/50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 outline-none placeholder:text-gray-300 transition-all"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Fixed Bid (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      required
                      value={proposalForm.budget}
                      onChange={(e) => setProposalForm({ ...proposalForm, budget: e.target.value })}
                      placeholder="5000"
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Estimated Days</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      required
                      value={proposalForm.timeline}
                      onChange={(e) => setProposalForm({ ...proposalForm, timeline: e.target.value })}
                      placeholder="14"
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
                    />
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmittingProposal}
                className="btn-premium w-full py-4 text-lg mt-4 shadow-xl shadow-primary-500/20"
              >
                {isSubmittingProposal ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Securing Connection...
                  </span>
                ) : (
                  <>
                    <Briefcase className="h-5 w-5 mr-2" />
                    Submit High-Impact Proposal
                  </>
                )}
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
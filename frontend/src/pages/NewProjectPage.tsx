import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Save } from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const NewProjectPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budgetMin: '',
    budgetMax: '',
    currency: 'USD',
    estimatedWeeks: '',
    flexibility: 'flexible' as 'fixed' | 'flexible' | 'negotiable'
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAIAnalysis = async () => {
    if (!formData.description) {
      toast.error('Please provide a rough description first!')
      return
    }

    setIsAnalyzing(true)
    try {
      const result: any = await api.analyzeProject(formData.description)
      const analysis = result?.data?.analysis || result?.analysis
      
      if (analysis) {
        setFormData(prev => ({
          ...prev,
          title: analysis.title || prev.title,
          description: analysis.structuredRequirements 
            ? `## Requirements\n${analysis.structuredRequirements.join('\n')}\n\n## Recommended Stack\n${analysis.recommendedTechStack?.join(', ')}`
            : prev.description,
          budgetMin: analysis.suggestedBudget?.min?.toString() || prev.budgetMin,
          budgetMax: analysis.suggestedBudget?.max?.toString() || prev.budgetMax,
          estimatedWeeks: analysis.suggestedTimelineWeeks?.toString() || prev.estimatedWeeks
        }))
        toast.success('AI has refined your requirements!')
      }
    } catch (err: any) {
      toast.error('AI analysis failed. You can still create it manually.')
      console.error(err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      toast.error('Title and description are required')
      return
    }

    setIsSubmitting(true)

    try {
      // Format payload to match expected backend type (or backend handles transformation)
      const payload = {
        title: formData.title,
        description: formData.description,
        budget: {
          min: Number(formData.budgetMin) || 0,
          max: Number(formData.budgetMax) || 0,
          currency: formData.currency
        },
        timeline: {
          estimatedWeeks: Number(formData.estimatedWeeks) || 1,
          flexibility: formData.flexibility
        }
      }

      await api.createProject(payload)
      toast.success('Project created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Prevent developers from creating projects (Client feature)
  if (user?.userType === 'developer') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">Only clients can create projects.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Return to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 -ml-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="glass-card overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">

            {/* Basic Details */}
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Basic Details</h3>
                    <p className="text-sm text-gray-500">Give your project a clear title and description.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAIAnalysis}
                    disabled={isAnalyzing || !formData.description}
                    className={`btn-premium ai-glow ${isAnalyzing ? 'ai-glow-active' : ''} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isAnalyzing ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        AI Brainstorming...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">✨</span>
                        Optimize with AI
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Project Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g. Build an AI-powered email assistant"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Project Description <span className="text-red-500">*</span></label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe what you want to build in detail. Don't worry, our AI will help refine this later!"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow resize-y"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className="p-6 md:p-8 space-y-6 bg-gray-50">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Budget & Timeline</h3>
                <p className="text-sm text-gray-500 mb-4">Set your expectations for cost and speed.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Budget */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Estimated Budget Range</label>
                    <div className="flex items-center space-x-2">
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="USD">USD $</option>
                        <option value="EUR">EUR €</option>
                        <option value="GBP">GBP £</option>
                      </select>
                      <input
                        type="number"
                        name="budgetMin"
                        value={formData.budgetMin}
                        onChange={handleChange}
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        name="budgetMax"
                        value={formData.budgetMax}
                        onChange={handleChange}
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Estimated Project Length</label>
                    <div className="flex space-x-4">
                      <div className="w-1/2">
                        <div className="relative">
                          <input
                            type="number"
                            name="estimatedWeeks"
                            value={formData.estimatedWeeks}
                            onChange={handleChange}
                            placeholder="e.g. 4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 pr-16"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">Weeks</span>
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2">
                        <select
                          name="flexibility"
                          value={formData.flexibility}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="flexible">Flexible</option>
                          <option value="fixed">Fixed Deadline</option>
                          <option value="negotiable">Open to negotiation</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 bg-gray-50 flex justify-end space-x-4 rounded-b-xl border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white font-medium transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary inline-flex items-center px-6 py-2"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save & Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewProjectPage
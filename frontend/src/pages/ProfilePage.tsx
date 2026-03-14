import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Briefcase, ChevronDown, User as ProfileIcon, Save } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

const ProfilePage: React.FC = () => {
  const { user: authUser, signOut, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    skills: '',
    hourlyRate: '',
    userType: 'client',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res: any = await api.getProfile()
      const p = res?.data?.profile || res?.profile || {}
      setForm({
        firstName: p.profile?.firstName || p.firstName || '',
        lastName: p.profile?.lastName || p.lastName || '',
        bio: p.profile?.bio || '',
        skills: (p.profile?.skills || []).join(', '),
        hourlyRate: p.profile?.hourlyRate?.toString() || '',
        userType: p.userType || 'client',
      })
    } catch (err) {
      console.error('Failed to load profile', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await api.updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        bio: form.bio,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
        userType: form.userType,
      })
      await refreshUser()
      toast.success('Profile saved!')
    } catch (err) {
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-12">
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
                Your Profile
              </h1>
            </div>
            <nav className="flex items-center space-x-2">
              <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-xl text-sm font-medium transition-colors">Dashboard</Link>
              <button onClick={signOut} className="text-gray-600 hover:text-red-500 px-3 py-2 rounded-xl text-sm font-medium transition-colors">Sign Out</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Avatar + Account Type */}
        <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/30 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-primary-500/20">
            <ProfileIcon className="h-10 w-10 text-white" />
          </div>
          <div className="text-center md:text-left">
            <p className="text-2xl font-black text-gray-900 tracking-tight">
              {form.firstName || authUser?.profile?.firstName || 'Clarity'}
              {' '}
              {form.lastName || authUser?.profile?.lastName || 'Expert'}
            </p>
            <p className="text-sm font-bold text-primary-500 uppercase tracking-widest mt-1">{authUser?.email || ''}</p>
            <div className="mt-4 flex items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase tracking-tighter border border-gray-200">
                Verified Expert
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase tracking-tighter border border-green-200">
                {form.userType} Account
              </span>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="glass-card p-8 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tight">
            <ProfileIcon className="h-5 w-5 text-primary-500" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={set('firstName')}
                className="w-full bg-white/50 border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none font-semibold transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={set('lastName')}
                className="w-full bg-white/50 border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none font-semibold transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">About You</label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={set('bio')}
              placeholder="Tell others a bit about yourself..."
              className="w-full bg-white/50 border border-gray-200 rounded-2xl p-4 focus:ring-2 focus:ring-primary-500 outline-none font-medium resize-none transition-all placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Professional Info */}
        <div className="glass-card p-8 space-y-6 border-t-4 border-t-accent-500/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tight">
            <Briefcase className="h-5 w-5 text-accent-500" /> Professional Identity
          </h2>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Primary Goal</label>
            <div className="relative">
              <select
                value={form.userType}
                onChange={set('userType')}
                className="appearance-none w-full bg-white/50 border border-gray-200 rounded-2xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary-500 outline-none font-bold transition-all"
              >
                <option value="client">Post high-impact projects as a Client</option>
                <option value="developer">Work on elite projects as a Developer</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          {form.userType === 'developer' && (
            <div className="space-y-6 pt-2 float-animation">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Expertise Domains <span className="text-gray-300 italic">(comma-separated)</span></label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={set('skills')}
                  placeholder="React, Distributed Systems, UI/UX..."
                  className="w-full bg-white/50 border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary-500 outline-none font-semibold transition-all placeholder:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Global Hourly Rate (USD)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</div>
                  <input
                    type="number"
                    value={form.hourlyRate}
                    onChange={set('hourlyRate')}
                    placeholder="100"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 bg-white/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none font-black transition-all"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-premium w-full py-4 text-lg shadow-xl shadow-primary-500/20"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Preserving Credentials...
            </span>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Sync Professional Profile
            </>
          )}
        </button>
      </main>
    </div>
  )
}

export default ProfilePage
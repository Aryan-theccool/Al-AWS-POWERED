import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { User as ProfileIcon, Save, ArrowLeft, Briefcase } from 'lucide-react'
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
              <h1 className="text-lg font-semibold text-gray-900">Profile Settings</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
              <button onClick={signOut} className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Sign Out</button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Avatar + Account Type */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <ProfileIcon className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {form.firstName || authUser?.profile?.firstName || 'Your Name'}
              {' '}
              {form.lastName || authUser?.profile?.lastName || ''}
            </p>
            <p className="text-sm text-gray-500">{authUser?.email || ''}</p>
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <ProfileIcon className="h-4 w-4" /> Personal Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={set('firstName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={set('lastName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={set('bio')}
              placeholder="Tell others a bit about yourself..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-4 w-4" /> Professional
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              value={form.userType}
              onChange={set('userType')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="client">Client — I post projects</option>
              <option value="developer">Developer — I work on projects</option>
            </select>
          </div>
          {form.userType === 'developer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills <span className="text-gray-400">(comma-separated)</span></label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={set('skills')}
                  placeholder="React, Node.js, AWS..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (USD)</label>
                <input
                  type="number"
                  value={form.hourlyRate}
                  onChange={set('hourlyRate')}
                  placeholder="50"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </main>
    </div>
  )
}

export default ProfilePage
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Authenticator } from '@aws-amplify/ui-react'
import { Amplify, Auth, Hub } from 'aws-amplify'
import type { User } from '@shared/types'
import { api } from '../services/api'

// Configure Amplify using environment variables (set via vite.config.ts at build time)
Amplify.configure({
  Auth: {
    region: import.meta.env.VITE_AWS_REGION,
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_COGNITO_CLIENT_ID
  }
})

interface AuthContextType {
  user: User | null
  userId: string | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  accessToken: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthState()

    const listener = Hub.listen('auth', ({ payload: { event } }) => {
      if (event === 'signIn' || event === 'signOut') {
        checkAuthState()
      }
    })

    return () => listener()
  }, [])

  const checkAuthState = async () => {
    try {
      const authUser = await Auth.currentAuthenticatedUser()
      if (authUser) {
        setUserId(authUser.username)
        
        // Initial minimal user object
        const initialUser: User = {
          userId: authUser.username,
          email: authUser.attributes?.email || '',
          userType: 'client', // Temporary default
          profile: {
            firstName: authUser.attributes?.given_name || '',
            lastName: authUser.attributes?.family_name || '',
            preferences: {
              emailNotifications: true,
              pushNotifications: true,
              marketingEmails: false,
              language: 'en',
              timezone: 'UTC'
            }
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          gsi1pk: 'client',
          gsi1sk: new Date().toISOString()
        }
        setUser(initialUser)

        // Get access token for API calls
        try {
          const session = await Auth.currentSession()
          setAccessToken(session.getIdToken().getJwtToken())
          
          // Fetch full user profile from API
          try {
            const profileResult: any = await api.getProfile()
            const fullProfile = profileResult?.data?.user || profileResult?.user
            if (fullProfile) {
              setUser(fullProfile)
            }
          } catch (profileError) {
            console.error('Failed to fetch user profile:', profileError)
          }
        } catch (tokenError) {
          console.log('Could not fetch auth session:', tokenError)
        }
      }
    } catch (error) {
      console.log('No authenticated user:', error)
      setUser(null)
      setUserId(null)
      setAccessToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    await checkAuthState()
  }

  const signOut = async () => {
    try {
      await Auth.signOut()
      setUser(null)
      setUserId(null)
      setAccessToken(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value: AuthContextType = {
    user,
    userId,
    isLoading,
    signOut,
    refreshUser,
    accessToken
  }

  // If not configured yet (no environment variables), show a placeholder
  if (!import.meta.env.VITE_COGNITO_USER_POOL_ID) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Not Configured
          </h2>
          <p className="text-gray-600">
            Please configure AWS Cognito environment variables to enable authentication.
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      <Authenticator.Provider>
        {children}
      </Authenticator.Provider>
    </AuthContext.Provider>
  )
}
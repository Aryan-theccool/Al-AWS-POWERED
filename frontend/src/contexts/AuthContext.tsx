import React, { createContext, useContext, useEffect, useState } from 'react'
import { Authenticator } from '@aws-amplify/ui-react'
import { Amplify, Auth, Hub } from 'aws-amplify'
import type { User } from '@shared/types'

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
      const user = await Auth.currentAuthenticatedUser()
      if (user) {
        setUserId(user.username)
        // TODO: Fetch full user profile from API
        // For now, create a minimal user object
        const userProfile: User = {
          userId: user.username,
          email: user.attributes?.email || '',
          userType: 'client', // Default, will be updated from API
          profile: {
            firstName: user.attributes?.given_name || '',
            lastName: user.attributes?.family_name || '',
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
        setUser(userProfile)

        // Get access token for API calls
        try {
          const session = await Auth.currentSession()
          setAccessToken(session.getAccessToken().getJwtToken())
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
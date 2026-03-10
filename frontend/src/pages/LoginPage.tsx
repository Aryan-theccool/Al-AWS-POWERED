import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ClarityBridge
          </h1>
          <p className="text-gray-600">
            AI-Powered Knowledge Marketplace
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Authenticator
            loginMechanisms={['email']}
            signUpAttributes={['given_name', 'family_name']}
          >
            {({ signOut, user }) => (
              <div className="text-center">
                <p className="text-green-600 mb-4">
                  Welcome, {user?.username}!
                </p>
                <button
                  onClick={signOut}
                  className="btn-secondary"
                >
                  Sign out
                </button>
              </div>
            )}
          </Authenticator>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
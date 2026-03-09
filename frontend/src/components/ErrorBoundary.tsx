import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    
    // Log to monitoring service in production
    if (import.meta.env.PROD) {
      // TODO: Send to error tracking service (Sentry, etc.)
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Please try reloading the page.
            </p>
            
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
                <p className="text-xs text-red-700 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <button
              onClick={this.handleReload}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
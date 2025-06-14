// Enhanced Error Handling and User Feedback System
import React, { createContext, useContext, useState, useCallback } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  X, 
  RefreshCw,
  Bug,
  Wifi,
  WifiOff
} from 'lucide-react'

// Error Types and Severity Levels
export const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  SERVER: 'server',
  CLIENT: 'client',
  UPLOAD: 'upload',
  PROCESSING: 'processing'
}

export const SEVERITY_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
}

// Enhanced Error Context
const ErrorContext = createContext()

export function ErrorProvider({ children }) {
  const [errors, setErrors] = useState([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [retryQueue, setRetryQueue] = useState([])

  // Monitor network status
  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Process retry queue when back online
      processRetryQueue()
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      addError({
        type: ERROR_TYPES.NETWORK,
        severity: SEVERITY_LEVELS.WARNING,
        message: 'You are currently offline. Some features may not be available.',
        persistent: true,
        id: 'offline-status'
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const addError = useCallback((error) => {
    const errorWithId = {
      id: error.id || Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...error
    }

    setErrors(prev => {
      // Remove existing error with same ID if it exists
      const filtered = prev.filter(e => e.id !== errorWithId.id)
      return [...filtered, errorWithId]
    })

    // Auto-remove non-persistent errors after delay
    if (!error.persistent) {
      setTimeout(() => {
        removeError(errorWithId.id)
      }, error.duration || 5000)
    }

    // Log error for debugging
    console.error('Application Error:', errorWithId)
  }, [])

  const removeError = useCallback((errorId) => {
    setErrors(prev => prev.filter(e => e.id !== errorId))
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors([])
  }, [])

  const addToRetryQueue = useCallback((operation) => {
    setRetryQueue(prev => [...prev, {
      id: Date.now() + Math.random(),
      operation,
      timestamp: new Date().toISOString()
    }])
  }, [])

  const processRetryQueue = useCallback(async () => {
    if (retryQueue.length === 0) return

    for (const item of retryQueue) {
      try {
        await item.operation()
        setRetryQueue(prev => prev.filter(r => r.id !== item.id))
      } catch (error) {
        console.error('Retry failed:', error)
      }
    }
  }, [retryQueue])

  const value = {
    errors,
    isOnline,
    addError,
    removeError,
    clearAllErrors,
    addToRetryQueue,
    processRetryQueue
  }

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <ErrorDisplay />
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}

// Enhanced Error Display Component
function ErrorDisplay() {
  const { errors, removeError, isOnline } = useError()

  if (errors.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {errors.map((error) => (
        <ErrorAlert key={error.id} error={error} onDismiss={() => removeError(error.id)} />
      ))}
    </div>
  )
}

// Individual Error Alert Component
function ErrorAlert({ error, onDismiss }) {
  const getIcon = () => {
    switch (error.severity) {
      case SEVERITY_LEVELS.INFO:
        return <Info className="h-4 w-4" />
      case SEVERITY_LEVELS.WARNING:
        return <AlertTriangle className="h-4 w-4" />
      case SEVERITY_LEVELS.ERROR:
        return <AlertCircle className="h-4 w-4" />
      case SEVERITY_LEVELS.CRITICAL:
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getVariant = () => {
    switch (error.severity) {
      case SEVERITY_LEVELS.INFO:
        return 'default'
      case SEVERITY_LEVELS.WARNING:
        return 'warning'
      case SEVERITY_LEVELS.ERROR:
      case SEVERITY_LEVELS.CRITICAL:
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <Alert variant={getVariant()} className="relative pr-8">
      {getIcon()}
      <AlertTitle className="flex items-center justify-between">
        {error.title || getDefaultTitle(error.type)}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </AlertTitle>
      <AlertDescription>
        {error.message}
        {error.suggestion && (
          <div className="mt-2 text-sm">
            <strong>Suggestion:</strong> {error.suggestion}
          </div>
        )}
        {error.actions && (
          <div className="mt-2 space-x-2">
            {error.actions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant={action.variant || 'outline'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

// Helper function to get default titles
function getDefaultTitle(type) {
  switch (type) {
    case ERROR_TYPES.NETWORK:
      return 'Network Error'
    case ERROR_TYPES.VALIDATION:
      return 'Validation Error'
    case ERROR_TYPES.PERMISSION:
      return 'Permission Denied'
    case ERROR_TYPES.SERVER:
      return 'Server Error'
    case ERROR_TYPES.CLIENT:
      return 'Application Error'
    case ERROR_TYPES.UPLOAD:
      return 'Upload Error'
    case ERROR_TYPES.PROCESSING:
      return 'Processing Error'
    default:
      return 'Error'
  }
}

// Enhanced API Error Handler
export function createApiErrorHandler(addError, addToRetryQueue) {
  return async (error, operation = null) => {
    let errorDetails = {
      type: ERROR_TYPES.SERVER,
      severity: SEVERITY_LEVELS.ERROR
    }

    if (error.response) {
      // Server responded with error status
      const status = error.response.status
      const data = error.response.data

      switch (status) {
        case 400:
          errorDetails = {
            type: ERROR_TYPES.VALIDATION,
            severity: SEVERITY_LEVELS.WARNING,
            title: 'Invalid Request',
            message: data.message || 'The request contains invalid data.',
            suggestion: 'Please check your input and try again.'
          }
          break
        case 401:
          errorDetails = {
            type: ERROR_TYPES.PERMISSION,
            severity: SEVERITY_LEVELS.ERROR,
            title: 'Authentication Required',
            message: 'You need to log in to access this resource.',
            suggestion: 'Please log in and try again.',
            actions: [{
              label: 'Log In',
              onClick: () => window.location.href = '/login'
            }]
          }
          break
        case 403:
          errorDetails = {
            type: ERROR_TYPES.PERMISSION,
            severity: SEVERITY_LEVELS.ERROR,
            title: 'Access Denied',
            message: 'You do not have permission to perform this action.',
            suggestion: 'Contact your administrator if you believe this is an error.'
          }
          break
        case 404:
          errorDetails = {
            type: ERROR_TYPES.CLIENT,
            severity: SEVERITY_LEVELS.WARNING,
            title: 'Not Found',
            message: 'The requested resource could not be found.',
            suggestion: 'Please check the URL or try refreshing the page.'
          }
          break
        case 429:
          errorDetails = {
            type: ERROR_TYPES.SERVER,
            severity: SEVERITY_LEVELS.WARNING,
            title: 'Rate Limited',
            message: 'Too many requests. Please wait before trying again.',
            suggestion: 'Wait a moment and try again.'
          }
          break
        case 500:
          errorDetails = {
            type: ERROR_TYPES.SERVER,
            severity: SEVERITY_LEVELS.ERROR,
            title: 'Server Error',
            message: 'An internal server error occurred.',
            suggestion: 'Please try again later or contact support if the problem persists.',
            actions: operation ? [{
              label: 'Retry',
              onClick: () => operation()
            }] : []
          }
          break
        default:
          errorDetails = {
            type: ERROR_TYPES.SERVER,
            severity: SEVERITY_LEVELS.ERROR,
            title: 'Server Error',
            message: data.message || `Server error (${status})`,
            suggestion: 'Please try again later.'
          }
      }
    } else if (error.request) {
      // Network error
      errorDetails = {
        type: ERROR_TYPES.NETWORK,
        severity: SEVERITY_LEVELS.ERROR,
        title: 'Network Error',
        message: 'Unable to connect to the server.',
        suggestion: 'Check your internet connection and try again.',
        actions: operation ? [{
          label: 'Retry',
          onClick: () => operation()
        }, {
          label: 'Retry When Online',
          onClick: () => addToRetryQueue(operation)
        }] : []
      }
    } else {
      // Client-side error
      errorDetails = {
        type: ERROR_TYPES.CLIENT,
        severity: SEVERITY_LEVELS.ERROR,
        title: 'Application Error',
        message: error.message || 'An unexpected error occurred.',
        suggestion: 'Please refresh the page and try again.'
      }
    }

    addError(errorDetails)
  }
}

// System Status Component
export function SystemStatus() {
  const { isOnline, errors } = useError()
  const criticalErrors = errors.filter(e => e.severity === SEVERITY_LEVELS.CRITICAL)
  const hasErrors = errors.length > 0

  return (
    <div className="flex items-center space-x-2">
      {/* Network Status */}
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600" />
        )}
        <span className="text-sm text-gray-600">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Error Status */}
      {hasErrors && (
        <div className="flex items-center space-x-1">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <Badge variant={criticalErrors.length > 0 ? 'destructive' : 'secondary'}>
            {errors.length} {errors.length === 1 ? 'issue' : 'issues'}
          </Badge>
        </div>
      )}
    </div>
  )
}

// Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to external service
    console.error('React Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bug className="h-5 w-5 text-red-600" />
                <span>Application Error</span>
              </CardTitle>
              <CardDescription>
                Something went wrong. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>If this problem persists, please contact support with the following information:</p>
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                  {this.state.error && this.state.error.toString()}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}


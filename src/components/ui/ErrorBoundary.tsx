'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <p className="text-red-500">
            Something went wrong. Please try again later.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-primary hover:text-primary/80"
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

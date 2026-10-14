import React, { Component, type ReactNode } from "react"
import { ErrorPage } from "../pages/ErrorPage"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught runtime exception caught by ErrorBoundary:", error, errorInfo)
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          type="500"
          title="Application Encountered an Error"
          message={this.state.error?.message || "An unexpected rendering error occurred. Please try reloading."}
          onRetry={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

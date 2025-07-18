import { Component, ReactNode } from 'react';
import { showToast } from '@components/ui/Toast';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    showToast({ message: error.message, type: 'error' });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="p-8 text-center">Something went wrong.</div>;
    }
    return this.props.children;
  }
} 
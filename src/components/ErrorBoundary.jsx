import React from 'react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-neutral-400 mb-6 max-w-md">
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <div className="flex gap-4">
             <Button 
               onClick={() => window.location.reload()}
               className="bg-red-600 hover:bg-red-700 text-white"
             >
               Refresh Page
             </Button>
             <Button 
               variant="outline"
               onClick={() => window.location.href = '/'}
               className="border-neutral-700 text-white"
             >
               Go Home
             </Button>
          </div>
          <pre className="mt-8 p-4 bg-black/50 rounded text-xs text-red-400 overflow-auto max-w-full text-left">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
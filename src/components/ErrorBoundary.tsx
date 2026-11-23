import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let displayMessage = error.message || 'An unexpected error occurred.';
    try {
      const parsed = JSON.parse(displayMessage) as {
        error?: string;
        operationType?: string;
        path?: string;
      };
      if (parsed.error) {
        displayMessage = `Data sync issue (${parsed.operationType || 'read'} on ${parsed.path || 'workspace'}): ${parsed.error}`;
      }
    } catch {
      // Plain error message
    }
    return { hasError: true, message: displayMessage };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFFAF0] flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-3xl border-2 border-[#FFD699] bg-white p-8 shadow-sm text-center space-y-5">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#FFF3D7] border border-[#FFBE1B] flex items-center justify-center text-[#B86E00]">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-[#24334F]">
                Something paused in Luminous Hand
              </h1>
              <p className="text-sm text-[#51617B] leading-relaxed break-words">
                {this.state.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#078F89] px-6 py-3 text-sm font-bold text-white hover:bg-[#067873] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Return to Luminous Hand
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

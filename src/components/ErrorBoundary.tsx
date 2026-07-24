import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-8">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              页面出现了一些问题
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              请尝试刷新页面。如果问题持续，可以检查控制台获取更多信息。
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-6 truncate max-w-full">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

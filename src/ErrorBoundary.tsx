import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  info: string | null;
}

/**
 * Catches render-time errors anywhere in the app tree and shows the actual
 * error message instead of an unhelpful blank white page.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, info: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('EVLab 3D Studio crashed:', error, errorInfo);
    this.setState({ info: errorInfo.componentStack ?? null });
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            width: '100vw',
            height: '100vh',
            background: '#0f172a',
            color: '#f1f5f9',
            fontFamily: 'monospace',
            padding: '24px',
            overflow: 'auto',
            boxSizing: 'border-box',
          }}
        >
          <h1 style={{ color: '#f87171', fontSize: '20px', marginBottom: '12px' }}>
            EVLab 3D Studio crashed
          </h1>
          <p style={{ marginBottom: '8px' }}>
            {this.state.error.message}
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              fontSize: '12px',
              color: '#94a3b8',
              background: '#1e293b',
              padding: '12px',
              borderRadius: '6px',
            }}
          >
            {this.state.error.stack}
            {this.state.info}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

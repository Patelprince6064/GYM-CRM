import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  /** Shown in the panel so the operator knows which view failed. */
  viewName?: string
}

interface State {
  error: Error | null
}

/**
 * Last line of defence for the workspace.
 *
 * React unmounts the *entire* tree when any component throws during render,
 * so a single bad lookup used to turn the whole dashboard into a blank black
 * page. This boundary keeps that failure contained to the view it happened
 * in — the shell, navigation and every other route keep working — and tells
 * the operator what went wrong instead of showing nothing.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Kept in the console so the failure is diagnosable from devtools.
    console.error(`[ErrorBoundary${this.props.viewName ? `: ${this.props.viewName}` : ''}]`, error, info.componentStack)
  }

  private reset = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="page-container">
        <div className="glass p-6 sm:p-8" role="alert">
          <div className="flex items-start gap-3">
            <span
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--border-color)',
              }}
            >
              <AlertTriangle size={18} color="#FFFFFF" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <div className="section-label">{this.props.viewName ?? 'View'}</div>
              <h2 className="text-base font-bold text-white">This section could not be displayed</h2>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                The rest of the workspace is unaffected — use the navigation to keep working. Reloading
                usually clears it; if it keeps happening, the message below will help track it down.
              </p>

              <div
                className="rounded-lg p-3 mt-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-faint)' }}
              >
                <code className="text-[0.7rem] break-words" style={{ color: 'var(--text-secondary)' }}>
                  {error.message || String(error)}
                </code>
              </div>

              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <button className="btn-secondary btn-sm" onClick={this.reset}>
                  <RefreshCw size={14} aria-hidden />
                  Try again
                </button>
                <button className="btn-ghost btn-sm" onClick={() => window.location.reload()}>
                  Reload page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

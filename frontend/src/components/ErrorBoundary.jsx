import { Component } from 'react'

/**
 * Last line of defence for render-time crashes. Without it, one bad API payload
 * unmounts the whole app and leaves a blank page.
 *
 * Mount it with a `key` that changes on navigation (e.g. the pathname) so moving to
 * another page clears the error. React already reports the caught error to the
 * console, so there is no extra logging here.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="py-24 text-center" role="alert">
        <p className="text-sm font-semibold text-red-600">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">This page couldn't be displayed</h1>
        <p className="mt-2 text-sm text-slate-500">Try again, or reload the page if the problem persists.</p>
        <button type="button" className="btn-primary mt-6" onClick={() => this.setState({ error: null })}>
          Try again
        </button>
      </div>
    )
  }
}

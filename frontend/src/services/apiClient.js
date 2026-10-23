import axios from 'axios'

/** Shared Axios instance; every service goes through it so base URL, timeout and CSRF are set in one place. */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  // Django's CSRF cookie/header names, used once session auth is enabled.
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
})

/** Drop empty filter values so they are not sent as `?field=`. */
export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  )
}

/** Turn an Axios/DRF error into a single human-readable message. */
export function getErrorMessage(error) {
  if (!error.response) {
    return error.code === 'ECONNABORTED'
      ? 'The server took too long to respond. Please try again.'
      : 'Unable to reach the server. Check your connection and try again.'
  }

  const { data, status } = error.response
  if (typeof data === 'string' || !data) return `Request failed (${status}).`
  if (data.detail) return data.detail

  return Object.entries(data)
    .map(([field, messages]) => {
      const text = Array.isArray(messages) ? messages.join(' ') : String(messages)
      return field === 'non_field_errors' ? text : `${field.replaceAll('_', ' ')}: ${text}`
    })
    .join(' ')
}

/** True for requests aborted via AbortSignal; callers treat these as silent, not as errors. */
export const isCancel = axios.isCancel

export default apiClient

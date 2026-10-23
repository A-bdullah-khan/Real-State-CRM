import apiClient, { cleanParams } from './apiClient'

/**
 * Lead endpoints. Read methods accept an Axios `config` so callers can pass an AbortSignal
 * (see useApiQuery); writes are user-initiated and are not cancelled.
 */
export const leadService = {
  /** Paginated, filterable lead list. Each lead carries `followup_count` and `next_followup_at`. */
  list: (params, config) =>
    apiClient.get('/leads/', { params: cleanParams(params), ...config }).then((res) => res.data),

  get: (id, config) => apiClient.get(`/leads/${id}/`, config).then((res) => res.data),

  /** Pipeline totals for the dashboard: `{ total, by_status, pending_followups }`. */
  stats: (config) => apiClient.get('/leads/stats/', config).then((res) => res.data),

  create: (payload) => apiClient.post('/leads/', payload).then((res) => res.data),

  update: (id, payload) => apiClient.patch(`/leads/${id}/`, payload).then((res) => res.data),
}

import apiClient, { cleanParams } from './apiClient'

// Draft generation waits on the LLM; the default API timeout is too short.
const AI_TIMEOUT = Number(import.meta.env.VITE_AI_TIMEOUT) || 120000

export const followUpService = {
  list: (params, config) =>
    apiClient.get('/followups/', { params: cleanParams(params), ...config }).then((res) => res.data),

  /** Also used to cancel a draft: `update(id, { status: 'cancelled' })`. */
  update: (id, payload) => apiClient.patch(`/followups/${id}/`, payload).then((res) => res.data),

  create: (payload) => apiClient.post('/followups/', payload).then((res) => res.data),

  /** Mark completed, optionally saving final edits (`notes`, `method`, `scheduled_at`) in the same request. */
  complete: (id, data = {}) => apiClient.post(`/followups/${id}/complete/`, data).then((res) => res.data),

  /**
   * Ask the AI to draft a follow-up for a lead. The backend saves it as a PENDING follow-up and returns it
   * with `draft: { message, next_step, rationale, suggested_method, suggested_scheduled_at }`.
   */
  generateDraft: (leadId) =>
    apiClient.post('/followups/generate-draft/', { lead_id: leadId }, { timeout: AI_TIMEOUT }).then((res) => res.data),
}

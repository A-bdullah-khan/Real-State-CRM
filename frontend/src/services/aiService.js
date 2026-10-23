import apiClient from './apiClient'

// One chat message can take several Groq round-trips (one per tool call), so allow far longer
// than the default API timeout.
const AI_TIMEOUT = Number(import.meta.env.VITE_AI_TIMEOUT) || 120000

export const aiService = {
  /** `{ configured, provider, model, tools }`; the chat UI disables itself when `configured` is false. */
  status: (config) => apiClient.get('/ai/status/', config).then((res) => res.data),

  /**
   * Send one user message to the AI agent.
   *
   * @param {string} message
   * @param {{ role: 'user' | 'assistant', content: string }[]} history  Earlier turns, oldest first.
   * @returns {Promise<{ reply: string, tool_calls?: { name: string, input: object, result: any }[] }>}
   */
  chat: (message, history = [], config) =>
    apiClient.post('/ai/chat/', { message, history }, { timeout: AI_TIMEOUT, ...config }).then((res) => res.data),
}

/**
 * Listings returned by the last successful `search_properties` tool call in a chat response.
 * Returns [] when the agent did not search or the response carries no tool data.
 */
export function getSearchResults(response) {
  const calls = Array.isArray(response?.tool_calls) ? response.tool_calls : []
  const search = calls.findLast((call) => call?.name === 'search_properties' && Array.isArray(call.result))
  return search ? search.result : []
}

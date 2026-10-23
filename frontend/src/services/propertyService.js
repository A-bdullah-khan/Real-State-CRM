import apiClient, { cleanParams } from './apiClient'

/** Read-only access to listings; property management happens in the Django admin. */
export const propertyService = {
  /** Paginated, filterable listing search. Resolves to DRF's `{ count, next, previous, results }`. */
  list: (params, config) =>
    apiClient.get('/properties/', { params: cleanParams(params), ...config }).then((res) => res.data),

  get: (id, config) => apiClient.get(`/properties/${id}/`, config).then((res) => res.data),
}

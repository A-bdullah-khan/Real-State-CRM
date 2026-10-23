// Public surface of the API layer. Components import from here, never from axios directly.
export { getErrorMessage } from './apiClient'
export { propertyService } from './propertyService'
export { leadService } from './leadService'
export { followUpService } from './followUpService'
export { aiService, getSearchResults } from './aiService'

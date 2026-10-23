import { useCallback, useEffect, useEffectEvent, useState } from 'react'
import { getErrorMessage, isCancel } from '../services/apiClient'

/**
 * Fetch data whenever `key` changes, cancelling stale requests.
 *
 * Lifecycle: each (key, reload) pair is one request. Changing either aborts the previous request
 * in the effect cleanup, so out-of-order responses can never overwrite newer data. `loading` stays
 * true until the current request settles, while `data` keeps the last good result to avoid flicker.
 *
 * @param {(options: { signal: AbortSignal }) => Promise<any>} queryFn
 * @param {string} key  Serialisable identity of the request (e.g. JSON of its params).
 */
export function useApiQuery(queryFn, key) {
  const [reloadCount, setReloadCount] = useState(0)
  const [result, setResult] = useState({ requestKey: null, data: null, error: null })
  const requestKey = `${key}#${reloadCount}`

  const runQuery = useEffectEvent((signal) => queryFn({ signal }))

  useEffect(() => {
    const controller = new AbortController()
    runQuery(controller.signal)
      .then((data) => setResult({ requestKey, data, error: null }))
      .catch((error) => {
        if (!isCancel(error)) setResult({ requestKey, data: null, error: getErrorMessage(error) })
      })
    return () => controller.abort()
  }, [requestKey])

  const reload = useCallback(() => setReloadCount((count) => count + 1), [])
  const isCurrent = result.requestKey === requestKey

  return {
    // Keep showing the previous data while a refetch is in flight.
    data: result.data,
    error: isCurrent ? result.error : null,
    loading: !isCurrent,
    reload,
  }
}

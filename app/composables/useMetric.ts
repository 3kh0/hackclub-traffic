import { computed, useRoute, useRouter } from '#imports'
export type Metric = 'requests' | 'bytes' | 'visits'

export const METRICS: Record<Metric, string> = {
  requests: 'Requests',
  bytes: 'Data Transfer',
  visits: 'Visits',
}

// breakdown item field holding each metric's total
export const TOTALS = { requests: 'totalRequests', bytes: 'totalBytes', visits: 'totalVisits' } as const

export function useMetric() {
  const route = useRoute()
  const router = useRouter()
  return computed<Metric>({
    get: () => (Object.hasOwn(METRICS, route.query.g as string) ? (route.query.g as Metric) : 'requests'),
    set: (g) => router.replace({ query: { ...route.query, g } }),
  })
}

import { computed, useRoute, useRouter } from '#imports'
export type Metric = 'requests' | 'bytes' | 'visits'

const VALID_METRICS: Metric[] = ['requests', 'bytes', 'visits']

export function useMetric() {
  const route = useRoute()
  const router = useRouter()

  const metric = computed<Metric>({
    get: () => {
      const g = route.query.g as string
      return VALID_METRICS.includes(g as Metric) ? (g as Metric) : 'requests'
    },
    set: (val: Metric) => {
      router.replace({ query: { ...route.query, g: val } })
    },
  })

  return metric
}

export const METRICS: Record<Metric, string> = {
  requests: 'Requests',
  bytes: 'Data Transfer',
  visits: 'Visits',
}

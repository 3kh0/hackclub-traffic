import type { Metric } from './useMetric'

interface BreakdownConfig {
  endpoint: string
  dataKey: string
  nameKey: string
  topN?: number
}

export function useBreakdown(cfg: BreakdownConfig) {
  const metric = useMetric()
  const span = useSpan()

  const { data, error, pending } = useFetch(cfg.endpoint, {
    query: { span },
  })
  useLoading(pending)

  const all = computed(() =>
    ((data.value as any)?.[cfg.dataKey] ?? []).map((item: any, i: number) => ({
      ...item,
      _index: i,
      name: item[cfg.nameKey],
    }))
  )

  const selected = ref(new Set<string>())
  const colorMap = useColorMap(selected)

  const sortKey = computed<'totalRequests' | 'totalBytes' | 'totalVisits'>(() =>
    metric.value === 'bytes' ? 'totalBytes' : metric.value === 'visits' ? 'totalVisits' : 'totalRequests'
  )

  watch([all, metric], ([v]) => {
    if (v.length) {
      const sorted = [...v].sort((a: any, b: any) => b[sortKey.value] - a[sortKey.value])
      selected.value = new Set(sorted.slice(0, cfg.topN ?? 5).map((item: any) => item.name))
    }
  }, { immediate: true, flush: 'sync' })

  function toggle(name: string) {
    const s = new Set(selected.value)
    s.has(name) ? s.delete(name) : s.size < 15 && s.add(name)
    selected.value = s
  }

  const chartSeries = computed(() =>
    all.value
      .filter((item: any) => selected.value.has(item.name))
      .map((item: any) => ({
        name: item.name as string,
        color: colorMap.value.get(item.name) ?? 'rgba(255,255,255,0.25)',
        data: item.daily.map((d: any) => ({
          time: new Date(d.date).getTime() / 1000,
          value: d[metric.value],
        })),
      }))
  )

  return {
    metric,
    span,
    data,
    error,
    pending,
    all,
    selected,
    colorMap,
    toggle,
    chartSeries,
  }
}

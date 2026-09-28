import { computed, ref, watch, useFetch } from '#imports'
import { TOTALS, useMetric } from './useMetric'
import { useSpan } from './useSpan'
import { useLoading } from './useLoading'
import { useColorMap } from './useColorMap'
import { ts } from '~/utils/format'
import { SEMANTIC } from '~/utils/palette'

interface BreakdownConfig {
  endpoint: string
  dataKey: string
  nameKey: string
  topN?: number
}

export function useBreakdown(cfg: BreakdownConfig) {
  const metric = useMetric()
  const span = useSpan()
  const { data, error, pending } = useFetch(cfg.endpoint, { query: { span } })
  useLoading(pending)

  const all = computed(() =>
    ((data.value as any)?.[cfg.dataKey] ?? []).map((item: any) => ({ ...item, name: item[cfg.nameKey] })),
  )

  const selected = ref(new Set<string>())
  const colorMap = useColorMap(selected)

  // select the top N by the current metric whenever data or metric changes
  watch(
    [all, metric],
    ([items, m]) => {
      if (items.length)
        selected.value = new Set(
          items
            .toSorted((a: any, b: any) => b[TOTALS[m]] - a[TOTALS[m]])
            .slice(0, cfg.topN ?? 5)
            .map((i: any) => i.name),
        )
    },
    { immediate: true, flush: 'sync' },
  )

  function toggle(name: string) {
    const s = new Set(selected.value)
    if (s.has(name)) s.delete(name)
    else if (s.size < 15) s.add(name)
    selected.value = s
  }

  const chartSeries = computed(() =>
    all.value
      .filter((i: any) => selected.value.has(i.name))
      .map((i: any) => ({
        name: i.name as string,
        color: colorMap.value.get(i.name) ?? SEMANTIC.disabled,
        data: i.daily.map((d: any) => ({ time: ts(d.date), value: d[metric.value] })),
      })),
  )

  return { metric, span, error, pending, all, selected, colorMap, toggle, chartSeries }
}

<template>
  <div v-if="error" class="text-down">Error: {{ error.message }}</div>
  <div v-else class="flex flex-col gap-6">
    <div class="bg-background">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg text-main font-semibold">{{ METRICS[metric] }} by Host</h2>
        <span class="text-subtext text-xs">Last 30 days</span>
      </div>
      <div class="h-80">
        <StackedAreaChart :series="chartSeries" :pending-last="true" :metric="metric" />
      </div>
    </div>

    <BreakdownTable
      label="Host"
      :items="items"
      :selected="selected"
      :color-map="colorMap"
      :default-sort="metric"
      @t="ti"
    />
  </div>
</template>

<script setup lang="ts">
import { datefx } from '~/utils/format'
const metric = useMetric()

const { data, error } = await useFetch('/api/hosts')

const all = computed(() =>
  ((data.value as any)?.hosts ?? []).map((h: any, i: number) => ({
    ...h, _index: i, name: h.host,
  }))
)

const selected = ref(new Set<string>())
const colorMap = useColorMap(selected)
const init = ref(false)

const sortKey = computed<'totalRequests' | 'totalBytes' | 'totalVisits'>(() =>
  metric.value === 'bytes' ? 'totalBytes' : metric.value === 'visits' ? 'totalVisits' : 'totalRequests'
)

watch([all, metric], ([v]) => {
  if (v.length) {
    const sorted = [...v].sort((a: any, b: any) => b[sortKey.value] - a[sortKey.value])
    selected.value = new Set(sorted.slice(0, 5).map((h: any) => h.name))
    init.value = true
  }
}, { immediate: true, flush: 'sync' })

function ti(name: string) {
  const s = new Set(selected.value)
  s.has(name) ? s.delete(name) : s.size < 15 && s.add(name)
  selected.value = s
}

const items = computed(() => all.value)


const chartSeries = computed(() =>
  all.value
    .filter((h: any) => selected.value.has(h.name))
    .map((h: any) => ({
      name: h.name as string,
      color: colorMap.value.get(h.name) ?? 'rgba(255,255,255,0.25)',
      data: h.daily.map((d: any) => ({ time: datefx(d.date), value: d[metric.value] })),
    }))
)
</script>
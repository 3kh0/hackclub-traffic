<template>
  <Banner v-if="error">Error: {{ error.message }}</Banner>
  <div v-else class="flex flex-col gap-6">
    <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
      <StatCard label="Cache Hit Ratio" :value="fmtPct(d.hitRatio ?? 0)" />
      <StatCard label="Bandwidth Saved" :value="fmt(d.savedBytes ?? 0)" />
      <StatCard label="Total Cached" :value="fmtNum(hitCount)" />
    </div>

    <LayerCard title="Cache over time">
      <div class="h-80">
        <StackedAreaChart :series="series" :span="span" />
      </div>
    </LayerCard>

    <LayerCard title="Cache Status Breakdown">
      <div class="grid items-center gap-6 md:grid-cols-2">
        <Donut :segments="slices" />
        <Bars :items="slices" />
      </div>
    </LayerCard>
  </div>
</template>

<script setup lang="ts">
import { CHART, SEMANTIC } from '~/utils/palette'
import { toSeries, toSlices } from '~/utils/series'

useHead({ title: 'Cache' })
const span = useSpan()

const { data, error, pending } = await useFetch('/api/cache', { query: { span } })
useLoading(pending)
const d = computed(() => (data.value ?? {}) as any)

const STATUS_COLORS: Record<string, string> = {
  hit: SEMANTIC.success,
  miss: SEMANTIC.attention,
  dynamic: CHART.blue,
  expired: SEMANTIC.warning,
  stale: CHART.purple,
  bypass: CHART.pink,
  revalidated: CHART.teal,
  updating: CHART.yellow,
  none: SEMANTIC.disabled,
}
const color = (s: string) => STATUS_COLORS[s] ?? SEMANTIC.disabled

const hitCount = computed(() => d.value.byStatus?.find((s: any) => s.status === 'hit')?.count ?? 0)
const series = computed(() => toSeries(d.value.timeline ?? [], 'status', color))
const slices = computed(() => toSlices(d.value.byStatus ?? [], 'status', color))
</script>

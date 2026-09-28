<template>
  <Banner v-if="error">Error: {{ error.message }}</Banner>
  <div v-else class="flex flex-col gap-6">
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="2xx Responses" :value="fmtNum(statusMap['2xx'] ?? 0)" />
      <StatCard label="4xx Responses" :value="fmtNum(statusMap['4xx'] ?? 0)" />
      <StatCard label="5xx Responses" :value="fmtNum(statusMap['5xx'] ?? 0)" />
      <StatCard label="Error Rate" :value="fmtPct(d.errorRate ?? 0)" />
    </div>

    <LayerCard title="Time to First Byte (ms)">
      <div class="h-80">
        <ChartSkeleton v-if="pending" />
        <AreaChart v-else :data="ttfb" :span="span" name="TTFB" />
      </div>
    </LayerCard>

    <LayerCard title="Origin Response Time (ms)">
      <div class="h-80">
        <ChartSkeleton v-if="pending" />
        <AreaChart v-else :data="origin" :span="span" :color="CHART.yellow" name="Origin" />
      </div>
    </LayerCard>

    <LayerCard title="Status Codes">
      <div class="grid items-center gap-6 md:grid-cols-2">
        <Donut :segments="slices" />
        <Bars :items="slices" />
      </div>
    </LayerCard>
  </div>
</template>

<script setup lang="ts">
import { CHART, SEMANTIC } from '~/utils/palette'
import { toSlices } from '~/utils/series'

useHead({ title: 'Performance' })
const span = useSpan()

const { data, error, pending } = await useFetch('/api/performance', { query: { span } })
useLoading(pending)
const d = computed(() => (data.value ?? {}) as any)

const statusMap = computed<Record<string, number>>(() =>
  Object.fromEntries((d.value.statusCodes ?? []).map((s: any) => [s.status, s.count])),
)
const line = (key: string) => (d.value[key] ?? []).map((p: any) => ({ time: ts(p.ts), value: p.value }))
const ttfb = computed(() => line('ttfb'))
const origin = computed(() => line('originTime'))

const color = (s: string) =>
  ({ '2': SEMANTIC.success, '3': CHART.blue, '4': SEMANTIC.warning })[s[0]!] ?? SEMANTIC.attention
const slices = computed(() => toSlices(d.value.statusCodes ?? [], 'status', color))
</script>

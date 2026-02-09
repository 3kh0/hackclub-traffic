<template>
  <div v-if="error" class="text-down">Error: {{ error.message }}</div>
  <div v-else class="flex flex-col gap-6">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="2xx Responses" :value="fmtNum(statusMap['2xx'])" />
      <StatCard label="4xx Responses" :value="fmtNum(statusMap['4xx'])" />
      <StatCard label="5xx Responses" :value="fmtNum(statusMap['5xx'])" />
      <StatCard label="Error Rate" :value="errorPct" />
    </div>

    <h2 class="text-lg text-main font-semibold mb-4">Time to First Byte (ms)</h2>
    <div class="h-80">
      <AreaChart :data="ttfbData" :span="span" />
    </div>

    <h2 class="text-lg text-main font-semibold mb-4">Origin Response Time (ms)</h2>
    <div class="h-80">
      <AreaChart
        :data="originData"
        :span="span"
        lineColor="rgba(255, 180, 60, 1)"
        topColor="rgba(255, 180, 60, 0.35)"
        bottomColor="rgba(255, 180, 60, 0)"
      />
    </div>

    <h2 class="text-lg text-main font-semibold mb-4">Status Code</h2>
    <div class="flex h-full justify-center items-center">
      <div class="w-1/2">
      <Donut :segments="seg" />
      </div>
      <div class="w-1/2">
      <Bars :items="bar" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ColorType } from 'lightweight-charts'

useHead({ title: 'Performance' })
const span = useSpan()

const { data, error, pending } = await useFetch('/api/performance', {
  query: { span },
})
useLoading(pending)

const statusMap = computed(() => {
  const map: Record<string, number> = {}
  for (const s of (data.value as any)?.statusCodes ?? []) {
    map[s.status] = s.count
  }
  return map
})

const errorPct = computed(() => {
  const rate = (data.value as any)?.errorRate ?? 0
  return `${(rate * 100).toFixed(1)}%`
})

const ttfbData = computed(() =>
  ((data.value as any)?.ttfb ?? []).map((d: any) => ({
    time: new Date(d.ts).getTime() / 1000,
    value: d.value,
  }))
)

const originData = computed(() =>
  ((data.value as any)?.originTime ?? []).map((d: any) => ({
    time: new Date(d.ts).getTime() / 1000,
    value: d.value,
  }))
)

const seg = computed(() => {
  const codes = (data.value as any)?.statusCodes ?? []
  const colorFor = (s: string) =>
    s === '2xx' ? '#22c55e' : s === '3xx' ? '#3b82f6' : s === '4xx' ? '#f59e0b' : '#ef4444'
  return codes.map((c: any) => ({ label: c.status, value: c.count, color: colorFor(c.status) }))
})

const bar = computed(() =>
  ((data.value as any)?.statusCodes ?? []).map((c: any) => ({
    label: c.status,
    value: c.count,
    color: c.status.startsWith('2')
      ? ('#22c55e' as ColorType)
      : c.status.startsWith('3')
      ? ('#3b82f6' as ColorType)
      : c.status.startsWith('4')
      ? ('#f59e0b' as ColorType)
      : ('#ef4444' as ColorType),
    formatted: fmtNum(c.count),
  }))
)
</script>

<template>
  <div v-if="error" class="text-down">Error: {{ error.message }}</div>
  <div v-else class="flex flex-col gap-6">
    <div class="bg-background">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg text-main font-semibold">{{ METRICS[metric] }} over time</h2>
        <span class="text-subtext text-xs">Last 30 days</span>
      </div>
      <div class="h-80">
        <AreaChart :data="d" :metric="metric" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { datefx } from '~/utils/format'

const metric = useMetric()

const { data, error } = await useFetch('/api/req')

const d = computed(() =>
  [...((data.value as any)?.daily ?? [])]
    .sort((a: any, b: any) => a.dimensions.date.localeCompare(b.dimensions.date))
    .map((d: any) => ({ time: datefx(d.dimensions.date), value: d.sum[metric.value] }))
)
</script>

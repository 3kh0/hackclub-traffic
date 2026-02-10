<template>
  <div v-if="error" class="text-down">Error: {{ error.message }}</div>
  <div v-else class="flex flex-col gap-6">
    <div class="bg-background">
      <h2 class="text-lg text-main font-semibold mb-4">{{ METRICS[metric] }} over time</h2>
      <div class="h-80">
        <StackedLoadingChart v-if="pending" />
        <StackedAreaChart v-else :series="chartSeries" :metric="metric" :span="span" />
      </div>
    </div>

    <BreakdownTable
      label="Operating System"
      :items="all"
      :selected="selected"
      :color-map="colorMap"
      :default-sort="metric"
      @t="toggle"
    />
  </div>
</template>

<script setup lang="ts">
import { METRICS } from '~/composables/useMetric'

useHead({ title: 'Operating Systems' })
const { metric, span, pending, error, all, selected, colorMap, toggle, chartSeries } = useBreakdown({
  endpoint: '/api/os',
  dataKey: 'oss',
  nameKey: 'os',
})
</script>

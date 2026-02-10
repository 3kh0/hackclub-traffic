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
      label="Browser"
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

useHead({ title: 'Browsers' })
const { metric, span, error, pending, all, selected, colorMap, toggle, chartSeries } = useBreakdown({
  endpoint: '/api/browsers',
  dataKey: 'browsers',
  nameKey: 'browser',
})
</script>

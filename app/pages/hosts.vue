<template>
  <div v-if="error" class="text-down">Error: {{ error.message }}</div>
  <div v-else class="flex flex-col gap-6">
    <div class="bg-background">
      <h2 class="text-lg text-main font-semibold mb-4">{{ METRICS[metric] }} over time</h2>
      <div class="h-80">
        <StackedAreaChart :series="chartSeries" :metric="metric" :span="span" />
      </div>
    </div>

    <BreakdownTable
      label="Host"
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

useHead({ title: 'Hosts' })
const { metric, span, error, all, selected, colorMap, toggle, chartSeries } = useBreakdown({
  endpoint: '/api/hosts',
  dataKey: 'hosts',
  nameKey: 'host',
})
</script>

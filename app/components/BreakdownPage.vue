<!-- stacked chart of the selected items + their breakdown table -->
<template>
  <Banner v-if="error">Error: {{ error.message }}</Banner>
  <div v-else class="flex flex-col gap-6">
    <LayerCard :title="`${METRICS[metric]} over time`">
      <div class="h-80">
        <ChartSkeleton v-if="pending" />
        <StackedAreaChart v-else :series="chartSeries" :metric="metric" :span="span" />
      </div>
    </LayerCard>

    <BreakdownTable
      :label="label"
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

const props = defineProps<{ label: string; endpoint: string; dataKey: string; nameKey: string }>()
const { metric, span, pending, error, all, selected, colorMap, toggle, chartSeries } = useBreakdown(props)
</script>

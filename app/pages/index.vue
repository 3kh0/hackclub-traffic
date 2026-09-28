<template>
  <Banner v-if="error">Error: {{ error.message }}</Banner>
  <div v-else class="flex flex-col gap-6">
    <LayerCard :title="`${METRICS[metric]} over time`">
      <div class="h-80">
        <ChartSkeleton v-if="pending" />
        <AreaChart v-else :data="points" :metric="metric" :span="span" :name="METRICS[metric]" />
      </div>
    </LayerCard>
  </div>
</template>

<script setup lang="ts">
import { METRICS } from '~/composables/useMetric'

useHead({ title: 'Overview' })
const metric = useMetric()
const span = useSpan()

const { data, error, pending } = useFetch('/api/req', { query: { span } })
useLoading(pending)

const points = computed(() =>
  ((data.value as any)?.data ?? [])
    .toSorted((a: any, b: any) => a.dimensions.ts.localeCompare(b.dimensions.ts))
    .map((p: any) => ({ time: ts(p.dimensions.ts), value: p.sum[metric.value] })),
)
</script>

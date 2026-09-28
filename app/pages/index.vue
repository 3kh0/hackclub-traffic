<template>
  <Banner v-if="error">Error: {{ error.message }}</Banner>
  <div v-else class="flex flex-col gap-6">
    <LayerCard :title="`${METRICS[metric]} over time`">
      <div class="h-80">
        <!-- data is fetched client-side only, so render the skeleton on the server -->
        <ClientOnly>
          <ChartSkeleton v-if="pending" />
          <AreaChart v-else :data="points" :metric="metric" :span="span" :name="METRICS[metric]" />
          <template #fallback><ChartSkeleton /></template>
        </ClientOnly>
      </div>
    </LayerCard>
  </div>
</template>

<script setup lang="ts">
import { METRICS } from '~/composables/useMetric'

useHead({ title: 'Overview' })
const metric = useMetric()
const span = useSpan()

const { data, error, pending } = useLazyFetch('/api/req', { query: { span }, server: false })
useLoading(pending)

const points = computed(() =>
  ((data.value as any)?.data ?? [])
    .toSorted((a: any, b: any) => a.dimensions.ts.localeCompare(b.dimensions.ts))
    .map((p: any) => ({ time: ts(p.dimensions.ts), value: p.sum[metric.value] })),
)
</script>

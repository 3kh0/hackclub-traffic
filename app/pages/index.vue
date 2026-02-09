<template>
  <div v-if="error" class="text-down">Error: {{ error.message }}</div>
  <div v-else class="flex flex-col gap-6">
    <div class="bg-background">
      <h2 class="text-lg text-main font-semibold mb-4">{{ METRICS[metric] }} over time</h2>
      <div class="h-80">
        <LoadingChart v-if="pending" />
        <AreaChart v-else :data="d" :metric="metric" :span="span" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { METRICS } from '~/composables/useMetric'

useHead({ title: 'Overview' })
const metric = useMetric()
const span = useSpan()

const { data, error, pending } = useLazyFetch('/api/req', {
  query: { span },
})
useLoading(pending)

const d = computed(() =>
  [...((data.value as any)?.data ?? [])]
    .sort((a: any, b: any) => a.dimensions.ts.localeCompare(b.dimensions.ts))
    .map((d: any) => ({ time: new Date(d.dimensions.ts).getTime() / 1000, value: d.sum[metric.value] }))
)
</script>

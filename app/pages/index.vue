<template>
  <div v-if="error" class="text-down">Error: {{ error.message }}</div>
  <div v-else class="flex flex-col gap-6">
    <div class="bg-background">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg text-main font-semibold">{{ METRICS[metric] }} over time</h2>
        <div class="flex items-center gap-2 mb-1.5">
          <select
            v-model="span"
            class="bg-transparent border border-white/10 px-2 py-1 text-xs text-subtext hover:text-main cursor-pointer focus:outline-none focus:border-white/25 appearance-none"
          >
            <option v-for="(label, id) in SPANS" :key="id" :value="Number(id)" class="bg-[#111]">{{ label }}</option>
          </select>
        </div>
      </div>
      <div class="h-80">
        <AreaChart :data="d" :metric="metric" :span="span" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Overview' })
const metric = useMetric()
const span = useSpan()

const { data, error, pending } = await useFetch('/api/req', {
  query: { span },
})
useLoading(pending)

const d = computed(() =>
  [...((data.value as any)?.data ?? [])]
    .sort((a: any, b: any) => a.dimensions.ts.localeCompare(b.dimensions.ts))
    .map((d: any) => ({ time: new Date(d.dimensions.ts).getTime() / 1000, value: d.sum[metric.value] }))
)
</script>

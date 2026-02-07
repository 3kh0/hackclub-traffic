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
        <StackedAreaChart :series="chartSeries" :metric="metric" :span="span" />
      </div>
    </div>

    <BreakdownTable
      label="Operating System"
      :items="items"
      :selected="selected"
      :color-map="colorMap"
      :default-sort="metric"
      @t="ti"
    />
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Operating Systems' })
const metric = useMetric()
const span = useSpan()

const { data, error } = await useFetch('/api/os', {
  query: { span },
})

const all = computed(() =>
  ((data.value as any)?.oss ?? []).map((c: any, i: number) => ({
    ...c, _index: i, name: c.os,
  }))
)

const selected = ref(new Set<string>())
const colorMap = useColorMap(selected)
const init = ref(false)

const sortKey = computed<'totalRequests' | 'totalBytes' | 'totalVisits'>(() =>
  metric.value === 'bytes' ? 'totalBytes' : metric.value === 'visits' ? 'totalVisits' : 'totalRequests'
)

watch([all, metric], ([v]) => {
  if (v.length) {
    const sorted = [...v].sort((a: any, b: any) => b[sortKey.value] - a[sortKey.value])
    selected.value = new Set(sorted.slice(0, 5).map((c: any) => c.name))
    init.value = true
  }
}, { immediate: true, flush: 'sync' })

function ti(name: string) {
  const s = new Set(selected.value)
  s.has(name) ? s.delete(name) : s.size < 15 && s.add(name)
  selected.value = s
}

const items = computed(() => all.value)

const chartSeries = computed(() =>
  all.value
    .filter((c: any) => selected.value.has(c.name))
    .map((c: any) => ({
      name: c.name as string,
      color: colorMap.value.get(c.name) ?? 'rgba(255,255,255,0.25)',
      data: c.daily.map((d: any) => ({ time: new Date(d.date).getTime() / 1000, value: d[metric.value] })),
    }))
)
</script>

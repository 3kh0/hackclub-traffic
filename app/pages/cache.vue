<template>
  <div v-if="error" class="text-down">Error: {{ error.message }}</div>
  <div v-else class="flex flex-col gap-6">
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard label="Cache Hit Ratio" :value="((data?.hitRatio ?? 0) * 100).toFixed(1) + '%'" />
      <StatCard label="Bandwidth Saved" :value="fmt((data as any)?.savedBytes ?? 0)" />
      <StatCard label="Total Cached" :value="fmtNum(hitCount)" />
    </div>

    <div class="bg-background">
      <h2 class="text-lg text-main font-semibold mb-4">Cache over time</h2>
      <div class="h-80">
        <StackedAreaChart :series="all" :span="span" />
      </div>
    </div>

    <div>
      <h2 class="text-lg text-main font-semibold mb-4">Cache Status Breakdown</h2>
      <div class="flex justify-center items-center gap-2">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Donut :segments="donutSegments" />
          <Bars :items="barItems" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Cache' })
const span = useSpan()

const { data, error, pending } = await useFetch('/api/cache', {
  query: { span },
})
useLoading(pending)

const STATUS_COLORS: Record<string, string> = {
  hit: 'rgba(34, 139, 73, 1)',
  miss: 'rgba(232, 20, 3, 1)',
  dynamic: 'rgba(70, 147, 255, 1)',
  expired: 'rgba(255, 180, 60, 1)',
  stale: 'rgba(190, 90, 255, 1)',
  bypass: 'rgba(255, 130, 200, 1)',
  revalidated: 'rgba(0, 220, 180, 1)',
  updating: 'rgba(140, 255, 120, 1)',
  none: 'rgba(153, 153, 153, 1)',
}

const hitCount = computed(() =>
  ((data.value as any)?.byStatus ?? []).find((s: any) => s.status === 'hit')?.count ?? 0
)

const all = computed(() => {
  const statuses = [...new Set(((data.value as any)?.timeline ?? []).map((e: any) => e.status))] as string[]
  return statuses.map(status => ({
    name: status,
    color: STATUS_COLORS[status] ?? 'rgba(153, 153, 153, 0.6)',
    data: ((data.value as any)?.timeline ?? [])
      .filter((e: any) => e.status === status)
      .map((e: any) => ({ time: new Date(e.ts).getTime() / 1000, value: e.count })),
  }))
})

const donutSegments = computed(() =>
  ((data.value as any)?.byStatus ?? []).map((s: any) => ({
    label: s.status,
    value: s.count,
    color: STATUS_COLORS[s.status],
  }))
)

const barItems = computed(() =>
  ((data.value as any)?.byStatus ?? []).map((s: any) => ({
    label: s.status,
    value: s.count,
    color: STATUS_COLORS[s.status],
  }))
)
</script>

<template>
  <div v-if="error" class="text-down">Error: {{ error.message }}</div>
  <div v-else class="flex flex-col gap-6">
    <div class="grid grid-cols-2 gap-4">
      <StatCard label="Total Events" :value="fmtNum((data as any)?.total ?? 0)" />
      <StatCard label="Blocked" :value="fmtNum(bc)" />
    </div>

    <div>
      <h2 class="text-lg text-main font-semibold mb-4">Events over time</h2>
      <div class="h-80">
        <StackedAreaChart :series="sac" :span="span" />
      </div>
    </div>

    <h2 class="text-lg text-main font-semibold mb-4">Action Breakdown</h2>
    <div class="flex justify-center items-center gap-2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Donut :segments="donutSegments" />
        <Bars :items="(data as any)?.byAction?.map((a: any) => ({ label: a.action, value: a.count, color: ACTION_COLORS[a.action] ?? 'rgba(153, 153, 153, 1)' })) ?? []" />
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <h2 class="text-lg text-main font-semibold mb-4">Top Blocked Countries</h2>
        <Bars :items="countryItems" color="red" />
      </div>
      <div>
        <h2 class="text-lg text-main font-semibold mb-4">Top Blocked Paths</h2>
        <Bars :items="pathItems" color="rgba(255, 180, 60, 1)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Security' })
const span = useSpan()

const { data, error, pending } = await useFetch('/api/security', {
  query: { span },
})
useLoading(pending)

const ACTION_COLORS: Record<string, string> = {
  block: 'rgba(232, 20, 3, 1)',
  challenge: 'rgba(255, 180, 60, 1)',
  jschallenge: 'rgba(255, 130, 200, 1)',
  managed_challenge: 'rgba(190, 90, 255, 1)',
  log: 'rgba(70, 147, 255, 1)',
  skip: 'rgba(100, 235, 80, 1)',
}

const bc = computed(() =>
  ((data.value as any)?.byAction ?? []).find((a: any) => a.action === 'block')?.count ?? 0
)

const sac = computed(() => {
  const actions = [...new Set(((data.value as any)?.timeline ?? []).map((e: any) => e.action))] as string[]
  return actions.map(action => ({
    name: action,
    color: ACTION_COLORS[action] ?? 'rgba(153, 153, 153, 1)',
    data: ((data.value as any)?.timeline ?? [])
      .filter((e: any) => e.action === action)
      .map((e: any) => ({ time: new Date(e.ts).getTime() / 1000, value: e.count })),
  }))
})

const donutSegments = computed(() =>
  ((data.value as any)?.byAction ?? []).map((a: any) => ({
    label: a.action,
    value: a.count,
    color: ACTION_COLORS[a.action] ?? 'rgba(153, 153, 153, 1)',
  }))
)

const countryItems = computed(() =>
  ((data.value as any)?.topCountries ?? []).map((c: any) => ({ label: c.countryName, value: c.count }))
)

const pathItems = computed(() =>
  ((data.value as any)?.topPaths ?? []).map((p: any) => ({ label: p.path, value: p.count }))
)
</script>

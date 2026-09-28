<template>
  <Banner v-if="error">Error: {{ error.message }}</Banner>
  <div v-else class="flex flex-col gap-6">
    <div class="grid grid-cols-2 gap-4">
      <StatCard label="Total Events" :value="fmtNum(d.total ?? 0)" />
      <StatCard label="Blocked" :value="fmtNum(blocked)" />
    </div>

    <LayerCard title="Events over time">
      <div class="h-80">
        <StackedAreaChart :series="series" :span="span" />
      </div>
    </LayerCard>

    <LayerCard title="Action Breakdown">
      <div class="grid items-center gap-6 md:grid-cols-2">
        <Donut :segments="slices" />
        <Bars :items="slices" />
      </div>
    </LayerCard>

    <div class="grid gap-6 md:grid-cols-2">
      <LayerCard title="Top Blocked Countries">
        <Bars :items="countries" :color="SEMANTIC.attention" />
      </LayerCard>
      <LayerCard title="Top Blocked Paths">
        <Bars :items="paths" :color="SEMANTIC.warning" />
      </LayerCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CHART, SEMANTIC } from '~/utils/palette'
import { toSeries, toSlices } from '~/utils/series'

useHead({ title: 'Security' })
const span = useSpan()

const { data, error, pending } = await useFetch('/api/security', { query: { span } })
useLoading(pending)
const d = computed(() => (data.value ?? {}) as any)

const ACTION_COLORS: Record<string, string> = {
  block: SEMANTIC.attention,
  challenge: SEMANTIC.warning,
  jschallenge: CHART.pink,
  managed_challenge: CHART.purple,
  log: CHART.blue,
  skip: SEMANTIC.success,
}
const color = (a: string) => ACTION_COLORS[a] ?? SEMANTIC.disabled

const blocked = computed(() => d.value.byAction?.find((a: any) => a.action === 'block')?.count ?? 0)
const series = computed(() => toSeries(d.value.timeline ?? [], 'action', color))
const slices = computed(() => toSlices(d.value.byAction ?? [], 'action', color))
const countries = computed(() =>
  (d.value.topCountries ?? []).map((c: any) => ({ label: c.countryName, value: c.count })),
)
const paths = computed(() => (d.value.topPaths ?? []).map((p: any) => ({ label: p.path, value: p.count })))
</script>

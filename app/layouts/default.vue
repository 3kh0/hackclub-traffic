<template>
  <div class="min-h-screen p-6 max-w-6xl mx-auto">
    <h1 class="text-main text-4xl font-bold mt-1 text-center">Hack Club Traffic Numbers</h1>
    <p class="text-subtext text-sm my-2 text-center">Explore the aggregate data behind hackclub.com</p>

    <div v-if="summary" class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
      <StatCard label="Total Requests" :value="fmtNum(summary.totalRequests)" />
      <StatCard label="Bandwidth" :value="fmt(summary.totalBytes)" />
      <StatCard label="Visitors" :value="fmtNum(summary.totalVisits)" />
      <StatCard label="Cache Hit Ratio" :value="(summary.cacheHitRatio * 100).toFixed(1) + '%'" />
    </div>

    <div class="flex flex-col sm:flex-row sm:items-end gap-2 mt-6 mb-4 border-b border-white/10">
      <div class="flex gap-1 flex-1 overflow-x-auto">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="{ path: tab.to, query: $route.query }"
          class="px-3 py-2 text-xs font-medium transition-colors relative cursor-pointer whitespace-nowrap"
          :class="$route.path === tab.to ? 'text-main' : 'text-subtext hover:text-main/70'"
        >
          {{ tab.label }}
          <div v-if="$route.path === tab.to" class="absolute bottom-0 left-0 right-0 h-0.5 bg-graph" />
        </NuxtLink>
      </div>
      <div class="flex items-center gap-3 mb-1.5 shrink-0">
        <div class="flex items-center gap-1.5">
          <label class="text-subtext text-xs">Metric:</label>
          <select
            v-model="metric"
            class="bg-white/2 border border-white/10 px-2 py-1 text-xs text-subtext hover:text-main cursor-pointer focus:outline-none focus:border-white/25 appearance-none"
          >
            <option v-for="(label, key) in METRICS" :key="key" :value="key" class="bg-[#111]">{{ label }}</option>
          </select>
        </div>
        <div class="flex items-center gap-1.5">
          <label class="text-subtext text-xs">Time:</label>
          <SpanSelect v-model="span" />
        </div>
      </div>
    </div>
    <slot />
    <p class="text-subtext text-sm my-6 text-center flex flex-wrap items-center justify-center gap-x-1">
      <span>Data provided by</span>
      <a href="https://developers.cloudflare.com/analytics/graphql-api/" target="_blank" rel="noopener" class="underline inline-flex items-center whitespace-nowrap"><img src="~/assets/cf.svg" alt="Cloudflare" class="inline-block w-5 h-5 mx-1" />Cloudflare GraphQL</a>
      <span>with charting by</span>
      <a href="https://www.tradingview.com/lightweight-charts/?utm_medium=lwc-link&utm_campaign=lwc-chart&utm_source=hackclub.com/" target="_blank" rel="noopener" class="underline inline-flex items-center whitespace-nowrap"><img src="~/assets/tv.svg" alt="TradingView" class="inline-block w-5 h-5 mx-1" />TradingView.</a> Open source at <a href="https://github.com/3kh0/hackclub-traffic" target="_blank" rel="noopener" class="underline inline-flex items-center whitespace-nowrap"><img src="~/assets/git.svg" alt="GitHub" class="inline-block w-4 h-4 mx-1" />GitHub</a>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { fmt, fmtNum } from '~/utils/format'
import { METRICS } from '~/composables/useMetric'

const metric = useMetric()
const span = useSpan()

const { data } = await useFetch('/api/summary', {
  query: { span },
})
const summary = computed(() => data.value as any)

const tabs = [
  { to: '/', label: 'Overview' },
  { to: '/hosts', label: 'Hosts' },
  { to: '/countries', label: 'Countries' },
  { to: '/browser', label: 'Browsers' },
  { to: '/os', label: 'Operating Systems' },
  { to: '/performance', label: 'Performance' },
  { to: '/security', label: 'Security' },
  { to: '/cache', label: 'Cache' },
]
</script>

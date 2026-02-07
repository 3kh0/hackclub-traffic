<template>
  <div class="min-h-screen p-6 max-w-6xl mx-auto">
    <h1 class="text-main text-4xl font-bold mt-1 text-center">Hack Club Traffic Numbers</h1>
    <p class="text-subtext text-sm my-2 text-center flex items-center justify-center">Explore the aggregate data behind hackclub.com</p>

    <div class="flex items-end gap-1 mt-6 mb-4 border-b border-white/10">
      <div class="flex gap-1 flex-1">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="{ path: tab.to, query: $route.query }"
          class="px-4 py-2 text-sm font-medium transition-colors relative cursor-pointer"
          :class="$route.path === tab.to ? 'text-main' : 'text-subtext hover:text-main/70'"
        >
          {{ tab.label }}
          <div v-if="$route.path === tab.to" class="absolute bottom-0 left-0 right-0 h-0.5 bg-graph" />
        </NuxtLink>
      </div>
      <div class="flex items-center gap-2 mb-1.5">
        <label class="text-subtext text-xs">Graph:</label>
        <select
          v-model="metric"
          class="bg-transparent border border-white/10 px-2 py-1 text-xs text-subtext hover:text-main cursor-pointer focus:outline-none focus:border-white/25 appearance-none"
        >
          <option v-for="(label, key) in METRICS" :key="key" :value="key" class="bg-[#111]">{{ label }}</option>
        </select>
      </div>
    </div>
    <slot />

    <p class="text-subtext text-sm mt-2 text-center flex items-center justify-center">Data provided by <a href="https://developers.cloudflare.com/analytics/graphql-api/" target="_blank" rel="noopener" class="underline inline-flex items-center"><img src="~/assets/cf.svg" alt="Cloudflare" class="inline-block w-5 h-5 mx-1.5" />Cloudflare GraphQL</a>&nbsp;with charting by <a href="https://www.tradingview.com/lightweight-charts/?utm_medium=lwc-link&utm_campaign=lwc-chart&utm_source=hackclub.com/" target="_blank" rel="noopener" class="underline inline-flex items-center"><img src="~/assets/tv.svg" alt="TradingView" class="inline-block w-5 h-5 mx-1.5" />TradingView</a></p>
  </div>
</template>

<script setup lang="ts">
const metric = useMetric()

const tabs = [
  { to: '/', label: 'Overview' },
  { to: '/hosts', label: 'Hosts' },
  { to: '/countries', label: 'Countries' },
  { to: '/browser', label: 'Browsers' },
  { to: '/os', label: 'Operating Systems' },
]
</script>

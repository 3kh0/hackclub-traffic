<template>
  <div class="isolate flex min-h-svh flex-col bg-kumo-base">
    <header class="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-kumo-line bg-kumo-base px-4">
      <NuxtLink
        to="/"
        class="flex items-center gap-2.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
      >
        <img src="/hackclub.svg" alt="" width="28" height="28" class="size-7" />
        <span class="text-base font-semibold text-kumo-strong">Hack Club</span>
      </NuxtLink>
      <span class="text-kumo-inactive" aria-hidden="true">/</span>
      <span class="truncate text-base font-medium text-kumo-default">Traffic Numbers</span>
      <div class="ml-auto flex items-center gap-1">
        <a
          href="https://github.com/3kh0/hackclub-traffic"
          target="_blank"
          rel="noopener"
          aria-label="Source on GitHub"
          :class="ghostButton"
        >
          <Icon name="github-logo" :size="18" />
        </a>
        <button type="button" :class="ghostButton" aria-label="Toggle color mode" @click="toggle">
          <ClientOnly>
            <Icon v-if="mode === 'dark'" name="sun" :size="18" />
            <Icon v-else name="moon" :size="18" />
            <template #fallback><span class="size-4.5" /></template>
          </ClientOnly>
        </button>
      </div>
    </header>

    <div class="flex flex-1">
      <!-- kumo Sidebar -->
      <aside
        class="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-[16.25rem] shrink-0 flex-col border-r border-kumo-line bg-kumo-base md:flex"
      >
        <nav class="flex flex-col gap-y-px p-2" aria-label="Analytics">
          <div class="px-3 pt-2 pb-1.5 text-xs font-medium text-kumo-subtle">Analytics</div>
          <NuxtLink
            v-for="tab in nav"
            :key="tab.to"
            :to="tab.link"
            :aria-current="tab.active ? 'page' : undefined"
            data-kumo-component="Sidebar"
            data-kumo-part="menu-button-link"
            class="relative flex min-h-8.5 w-full min-w-0 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-kumo-default outline-none focus-visible:bg-kumo-tint focus-visible:text-kumo-strong"
            :class="tab.active ? 'bg-kumo-tint' : 'hover:bg-kumo-tint'"
          >
            <Icon
              :name="tab.icon"
              :size="18"
              :weight="tab.active ? 'fill' : 'regular'"
              class="shrink-0"
              :class="tab.active ? 'text-kumo-default' : 'text-kumo-subtle'"
            />
            <span class="truncate">{{ tab.label }}</span>
          </NuxtLink>
        </nav>
        <div class="mt-auto border-t border-kumo-line p-4 text-xs text-kumo-subtle">
          Aggregate traffic for hackclub.com, served through Cloudflare.
        </div>
      </aside>

      <main class="min-w-0 flex-1">
        <!-- kumo Tabs (underline) replace the sidebar on small screens -->
        <nav
          class="kumo-tabs-list flex gap-4 overflow-x-auto border-b border-kumo-hairline px-4 md:hidden"
          aria-label="Analytics"
        >
          <NuxtLink
            v-for="tab in nav"
            :key="tab.to"
            :to="tab.link"
            :aria-current="tab.active ? 'page' : undefined"
            data-kumo-component="Tabs"
            data-kumo-part="tab"
            class="relative flex items-center rounded px-2 py-3 text-base whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
            :class="
              tab.active
                ? 'font-medium text-kumo-default'
                : 'text-kumo-subtle hover:bg-kumo-tint hover:text-kumo-default'
            "
          >
            {{ tab.label }}
            <span v-if="tab.active" class="absolute inset-x-0 bottom-0 h-0.5 bg-kumo-brand" />
          </NuxtLink>
        </nav>

        <div class="mx-auto flex max-w-6xl flex-col gap-6 p-4 md:p-6 lg:p-8">
          <!-- kumo PageHeader block -->
          <div class="flex flex-col gap-4 border-b border-kumo-line pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div class="flex flex-col gap-1">
              <h1 class="text-3xl font-semibold text-kumo-default">{{ current?.label }}</h1>
              <p class="max-w-prose text-base text-kumo-subtle">Explore the aggregate data behind hackclub.com</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <Select v-if="current?.metric" v-model="metric" :options="metricOptions" label="Metric">
                <template #icon><Icon name="chart-line-up" /></template>
              </Select>
              <Select v-model="span" :options="spanOptions" label="Time range">
                <template #icon><Icon name="calendar-blank" /></template>
              </Select>
            </div>
          </div>

          <div v-if="summary" class="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Requests" :value="fmtNum(summary.totalRequests)" />
            <StatCard label="Bandwidth" :value="fmt(summary.totalBytes)" />
            <StatCard label="Visitors" :value="fmtNum(summary.totalVisits)" />
            <StatCard label="Cache Hit Ratio" :value="fmtPct(summary.cacheHitRatio)" />
          </div>

          <slot />

          <footer
            class="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 border-t border-kumo-line pt-6 text-sm text-kumo-subtle"
          >
            <span>Data provided by</span>
            <a
              href="https://developers.cloudflare.com/analytics/graphql-api/"
              target="_blank"
              rel="noopener"
              :class="footerLink"
              ><img src="~/assets/cf.svg" alt="" class="mr-1 inline-block h-4 w-auto" />Cloudflare GraphQL</a
            >
            <span>with charting by</span>
            <span
              ><a
                href="https://www.tradingview.com/lightweight-charts/?utm_medium=lwc-link&utm_campaign=lwc-chart&utm_source=hackclub.com/"
                target="_blank"
                rel="noopener"
                :class="footerLink"
                ><img src="~/assets/tv.svg" alt="" class="mr-1 inline-block size-4" />TradingView</a
              >.</span
            >
            <span>Open source on</span>
            <span
              ><a href="https://github.com/3kh0/hackclub-traffic" target="_blank" rel="noopener" :class="footerLink"
                ><Icon name="github-logo" class="mr-1" />GitHub</a
              >.</span
            >
          </footer>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { METRICS, type Metric } from '~/composables/useMetric'
import { SPANS } from '~/composables/useSpan'
import type { IconName } from '~/utils/icons'

const route = useRoute()
const metric = useMetric()
const span = useSpan()
const { mode, toggle } = useColorMode()

// kumo Button: ghost variant, square shape, base size
const ghostButton =
  'flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-kumo-default hover:bg-kumo-tint focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand'
const footerLink = 'inline-flex items-center whitespace-nowrap align-bottom text-kumo-link hover:underline'

const metricOptions = (Object.keys(METRICS) as Metric[]).map((value) => ({ value, label: METRICS[value] }))
const spanOptions = Object.entries(SPANS).map(([id, label]) => ({ value: Number(id), label }))

const { data: summary } = await useFetch<any>('/api/summary', { query: { span } })

// metric: pages whose charts follow the Metric select
const tabs: { to: string; label: string; icon: IconName; metric: boolean }[] = [
  { to: '/', label: 'Overview', icon: 'squares-four', metric: true },
  { to: '/hosts', label: 'Hosts', icon: 'hard-drives', metric: true },
  { to: '/countries', label: 'Countries', icon: 'globe-hemisphere-west', metric: true },
  { to: '/browser', label: 'Browsers', icon: 'browser', metric: true },
  { to: '/os', label: 'Operating Systems', icon: 'desktop', metric: true },
  { to: '/performance', label: 'Performance', icon: 'gauge', metric: false },
  { to: '/security', label: 'Security', icon: 'shield-check', metric: false },
  { to: '/cache', label: 'Cache', icon: 'database', metric: false },
]
const nav = computed(() =>
  tabs.map((t) => ({ ...t, active: t.to === route.path, link: { path: t.to, query: route.query } })),
)
const current = computed(() => nav.value.find((t) => t.active))
</script>

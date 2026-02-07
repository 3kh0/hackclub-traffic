<template>
  <div ref="wrapper" class="w-full h-full relative">
    <div ref="chartContainer" class="w-full h-full" />
    <div
      v-if="tip.visible"
      class="absolute pointer-events-none z-10 bg-black/85 backdrop-blur-sm border border-white/25 rounded-lg px-3 py-2 text-xs font-mono"
      :style="{ left: tip.x + 'px', top: tip.y + 'px' }"
    >
      <div class="text-main font-bold mb-1 text-[11px]">{{ tip.time }}</div>
      <div v-for="item in tip.items" :key="item.name" class="flex items-center gap-2 py-0.5">
        <div class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: item.color }" />
        <span class="text-subtext flex-1 truncate max-w-45">{{ item.name }}</span>
        <span class="text-main font-medium ml-3 tabular-nums">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createChart, LineSeries, LineStyle, type IChartApi, type ISeriesApi, CrosshairMode } from 'lightweight-charts'

import type { Metric } from '~/composables/useMetric'
import { fmt, COLORS } from '~/utils/format'

const props = defineProps<{
  series: { name: string; data: { time: string | number; value: number }[]; color: string }[]
  metric?: Metric
}>()

const wrapper = ref<HTMLElement>()
const chartContainer = ref<HTMLElement>()
let chart: IChartApi | null = null
let instances: ISeriesApi<'Line'>[] = []
let pending: ISeriesApi<'Line'>[] = []
let bDiv = 1
let bUnit = 'B'

const tip = reactive({
  visible: false, x: 0, y: 0, time: '',
  items: [] as { name: string; color: string; value: string }[],
})

function fmtVal(v: number) {
  if (props.metric === 'bytes') return fmt(v * bDiv)
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(2) + 'k'
  return v.toFixed(0)
}

function fmtTime(t: number | string) {
  const d = typeof t === 'number' ? new Date(t * 1000) : new Date(t)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function resetSeries() {
  instances = []
  pending = []
}

function createChartInstance() {
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    layout: {
      background: { color: 'transparent' },
      textColor: 'rgb(153, 153, 153)',
      fontFamily: 'ui-monospace, monospace',
      fontSize: 11,
      attributionLogo: false,
      
    },
    grid: {
      vertLines: { color: 'rgba(255,255,255,0.06)' },
      horzLines: { color: 'rgba(255,255,255,0.06)' },
    },
    leftPriceScale: {
      visible: true,
      borderColor: 'rgba(255,255,255,0.1)',
      minimumWidth: 50,
    },
    rightPriceScale: {
      visible: false,
    },
    timeScale: {
      visible: true,
      borderColor: 'rgba(255,255,255,0.1)',
      timeVisible: true,
      secondsVisible: false,
    },
    crosshair: {
      mode: CrosshairMode.Normal,
      vertLine: {
        color: 'rgba(255,255,255,0.2)',
        width: 1,
        style: 2,
        labelVisible: false,
      },
      horzLine: {
        visible: false,
        labelVisible: false,
      },
    },
    handleScale: false,
    handleScroll: false,
    autoSize: true,
  })

  chart.subscribeCrosshairMove((param) => {
    if (!param.time || !param.seriesData || param.seriesData.size === 0) {
      tip.visible = false
      return
    }

    const items: { name: string; color: string; value: string }[] = []
    for (let i = 0; i < instances.length; i++) {
      const p = pending[i]
      const d = (param.seriesData.get(instances[i]!) ?? (p ? param.seriesData.get(p) : undefined)) as any
      if (d?.value !== undefined) {
        const s = props.series[i]!
        items.push({ name: s.name, color: s.color || COLORS[i % COLORS.length]!, value: fmtVal(d.value) })
      }
    }

    tip.items = items
    tip.time = fmtTime(param.time as number)
    tip.visible = true

    const rect = wrapper.value?.getBoundingClientRect()
    if (param.point && rect) {
      const tw = 260, th = 40 + items.length * 22
      let x = param.point.x + 56
      let y = param.point.y - th / 2
      if (x + tw > rect.width) x = param.point.x - tw - 16
      if (y < 0) y = 0
      if (y + th > rect.height) y = rect.height - th
      tip.x = x
      tip.y = y
    }
  })
  updateSeries()
  chart.timeScale().fitContent()
}

function updateSeries() {
  if (!chart) return

  for (const s of instances) chart.removeSeries(s)
  for (const s of pending) if (s) chart.removeSeries(s)
  resetSeries()

  const isBytes = props.metric === 'bytes'
  if (isBytes) {
    let max = 0
    for (const s of props.series)
      for (const d of s.data)
        if (d.value > max) max = d.value
    const k = 1024
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const idx = max > 0 ? Math.floor(Math.log(max) / Math.log(k)) : 0
    bDiv = Math.pow(k, idx)
    bUnit = units[idx] || 'B'
  } else {
    bDiv = 1
    bUnit = 'B'
  }

  for (let i = 0; i < props.series.length; i++) {
    const s = props.series[i]!
    const color = s.color || COLORS[i % COLORS.length]!
    const opts = {
      color,
      lineWidth: 2 as const,
      priceScaleId: 'left',
      priceFormat: {
        type: 'custom' as const,
        minMove: 1,
        formatter: (v: number) => {
          if (isBytes) return parseFloat(v.toFixed(2)) + ' ' + bUnit
          if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
          if (v >= 1e3) return (v / 1e3).toFixed(0) + 'k'
          return v.toFixed(0)
        },
      },
      lastValueVisible: false,
      priceLineVisible: false,
    }

    const data = isBytes
      ? s.data.map(d => ({ time: d.time, value: d.value / bDiv }))
      : s.data

    const inst = chart.addSeries(LineSeries, opts)

    if (s.data.length >= 2) {
      inst.setData(data.slice(0, -1) as any)
      const pi = chart.addSeries(LineSeries, { ...opts, lineStyle: LineStyle.Dashed })
      pi.setData(data.slice(-2) as any)
      pending.push(pi)
    } else {
      inst.setData(data as any)
      pending.push(null as any)
    }

    instances.push(inst)
  }
}

onMounted(() => createChartInstance())

watch(() => props.series, () => {
  updateSeries()
  chart?.timeScale().fitContent()
}, { deep: true })

watch(() => props.metric, () => {
  chart?.remove()
  chart = null
  resetSeries()
  createChartInstance()
})

onBeforeUnmount(() => {
  chart?.remove()
  chart = null
  resetSeries()
})
</script>

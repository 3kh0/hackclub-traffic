<template>
  <div ref="wrapper" class="w-full h-full relative">
    <div ref="chartContainer" class="w-full h-full" />
    <div
      v-if="tooltip.visible"
      class="absolute pointer-events-none z-10 bg-black/85 backdrop-blur-sm border border-white/25 rounded-lg px-3 py-2 text-xs font-mono"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="text-main text-[11px]">
        <span class="text-subtext">{{ tooltip.time }}: </span>
        <span class="font-bold">{{ tooltip.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createChart, AreaSeries, LineStyle, CrosshairMode, type IChartApi, type ISeriesApi } from 'lightweight-charts'

import type { Metric } from '~/composables/useMetric'
import { fmt, fmtNum } from '~/utils/format'

const props = defineProps<{
  data: { time: string | number; value: number }[]
  lineColor?: string
  topColor?: string
  bottomColor?: string
  height?: number
  minimal?: boolean
  metric?: Metric
}>()

const wrapper = ref<HTMLElement>()
const chartContainer = ref<HTMLElement>()
let chart: IChartApi | null = null
let series: ISeriesApi<'Area'> | null = null
let pendingSeries: ISeriesApi<'Area'> | null = null
let bDiv = 1
let bUnit = 'B'

const tooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  time: '',
  value: '',
})

function formatValue(price: number) {
  if (props.metric === 'bytes') return fmt(price * bDiv)
  return fmtNum(price)
}

function formatTime(t: number | string) {
  const date = typeof t === 'number' ? new Date(t * 1000) : new Date(t)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtPrice(price: number) {
  if (props.metric === 'bytes') return parseFloat(price.toFixed(2)) + ' ' + bUnit
  return fmtNum(price)
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

  series = chart.addSeries(AreaSeries, {
    lineColor: props.lineColor ?? 'rgba(70, 147, 255, 1)',
    topColor: props.topColor ?? 'rgba(70, 147, 255, 0.35)',
    bottomColor: props.bottomColor ?? 'rgba(70, 147, 255, 0)',
    lineWidth: 2 as const,
    lastValueVisible: false,
    priceLineVisible: false,
    priceScaleId: 'left',
    priceFormat: {
      type: 'custom',
      formatter: fmtPrice,
    },
    autoscaleInfoProvider: () => {
      const scaleData = props.data.length >= 2 ? props.data.slice(0, -1) : props.data
      return { priceRange: { minValue: 0, maxValue: Math.max(...scaleData.map(d => d.value / bDiv)) } }
    },
  })
  chart.subscribeCrosshairMove((param) => {
    if (!param.time || !param.seriesData || param.seriesData.size === 0) {
      tooltip.visible = false
      return
    }

    const data = (param.seriesData.get(series!) ?? (pendingSeries ? param.seriesData.get(pendingSeries) : undefined)) as any
    if (data && data.value !== undefined) {
      tooltip.value = formatValue(data.value)
      tooltip.time = formatTime(param.time as number)
      tooltip.visible = true
    } else {
      tooltip.visible = false
      return
    }

    const containerRect = wrapper.value?.getBoundingClientRect()
    if (param.point && containerRect) {
      const tooltipWidth = 180
      const tooltipHeight = 32
      let x = param.point.x + 56
      let y = param.point.y - tooltipHeight / 2

      if (x + tooltipWidth > containerRect.width) {
        x = param.point.x - tooltipWidth - 16
      }
      if (y < 0) y = 0
      if (y + tooltipHeight > containerRect.height) y = containerRect.height - tooltipHeight

      tooltip.x = x
      tooltip.y = y
    }
  })

  updateSeries(props.data)
  chart.timeScale().fitContent()
}

function nom(data: { time: string | number; value: number }[]) {
  const isBytes = props.metric === 'bytes'
  if (isBytes) {
    let max = 0
    for (const d of data) if (d.value > max) max = d.value
    const k = 1024
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const idx = max > 0 ? Math.floor(Math.log(max) / Math.log(k)) : 0
    bDiv = Math.pow(k, idx)
    bUnit = units[idx] || 'B'
    return data.map(d => ({ time: d.time, value: d.value / bDiv }))
  }
  bDiv = 1
  bUnit = 'B'
  return data
}

function updateSeries(data: { time: string | number; value: number }[]) {
  if (!series || !chart) return

  const normalized = nom(data)

  if (normalized.length >= 2) {
    const solidData = normalized.slice(0, -1)
    const dottedData = normalized.slice(-2)

    series.setData(solidData as any)

    if (!pendingSeries) {
      pendingSeries = chart.addSeries(AreaSeries, {
        lineColor: props.lineColor ?? 'rgb(70, 147, 255)',
        topColor: props.topColor ?? 'rgba(70, 147, 255, 0.35)',
        bottomColor: props.bottomColor ?? 'rgba(70, 147, 255, 0)',
        lineWidth: props.minimal ? 1 : 2,
        lineStyle: LineStyle.Dashed,
        priceScaleId: 'left',
        priceFormat: {
          type: 'custom',
          formatter: fmtPrice,
        },
        priceLineVisible: false,
        lastValueVisible: false,
      })
    }
    pendingSeries.setData(dottedData as any)
  } else {
    series.setData(normalized as any)
    if (pendingSeries) {
      pendingSeries.setData([] as any)
    }
  }
}

onMounted(() => createChartInstance())

watch(() => props.data, (newData) => {
  updateSeries(newData)
  chart?.timeScale().fitContent()
}, { deep: true })

watch(() => props.metric, () => {
  chart?.remove()
  chart = null
  series = null
  pendingSeries = null
  createChartInstance()
})

onBeforeUnmount(() => {
  chart?.remove()
  chart = null
  series = null
  pendingSeries = null
})
</script>

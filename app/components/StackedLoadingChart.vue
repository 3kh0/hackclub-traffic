<template>
  <div class="w-full h-full">
    <div ref="chartContainer" class="w-full h-full" />
  </div>
</template>

<script setup lang="ts">
import { createChart, LineSeries, createTextWatermark, type IChartApi, type ISeriesApi } from 'lightweight-charts'
import { COLORS } from '~/utils/format'

const chartContainer = ref<HTMLElement>()
let chart: IChartApi | null = null
let seriesList: ISeriesApi<'Line'>[] = []
let interval: ReturnType<typeof setInterval> | null = null

let timeCounter = 0

function wave(i: number, phase: number, offset: number) {
  const base = 20 + offset * 12
  return base
    + Math.sin((i + phase + offset * 1.3) * 0.4) * 14
    + Math.sin((i + phase + offset * 0.7) * 0.9) * 8
    + Math.sin((i + phase + offset * 2.1) * 1.7) * 4
}

function cnt(phase: number, offset: number) {
  return Array.from({ length: 25 }, (_, i) => wave(i, phase, offset))
}

function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number) {
  const t2 = t * t
  const t3 = t2 * t
  return 0.5 * (
    (2 * p1) +
    (-p0 + p2) * t +
    (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
    (-p0 + 3 * p1 - 3 * p2 + p3) * t3
  )
}

function inter(controls: number[], baseTime: number) {
  const points: { time: any; value: number }[] = []
  for (let i = 0; i < controls.length - 1; i++) {
    const p0 = controls[Math.max(i - 1, 0)]
    const p1 = controls[i]
    const p2 = controls[i + 1]
    const p3 = controls[Math.min(i + 2, controls.length - 1)]
    for (let s = 0; s < 8; s++) {
      const t = s / 8
      const val = catmullRom(p0, p1, p2, p3, t)
      const time = baseTime + (i * 8 + s) * 60
      points.push({ time: time as any, value: Math.max(2, val) })
    }
  }
  const last = controls[controls.length - 1]
  points.push({ time: (baseTime + (controls.length - 1) * 8 * 60) as any, value: Math.max(2, last) })
  return points
}

function createChartInstance() {
  if (!chartContainer.value) return

  chart = createChart(chartContainer.value, {
    layout: {
      background: { color: 'transparent' },
      textColor: 'rgba(255,255,255,0.15)',
      fontFamily: 'ui-monospace, monospace',
      fontSize: 11,
      attributionLogo: false,
    },
    grid: {
      vertLines: { color: 'rgba(255,255,255,0.03)' },
      horzLines: { color: 'rgba(255,255,255,0.03)' },
    },
    leftPriceScale: {
      visible: true,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    rightPriceScale: { visible: false },
    timeScale: {
      visible: true,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    crosshair: {
      vertLine: { visible: false, labelVisible: false },
      horzLine: { visible: false, labelVisible: false },
    },
    handleScale: false,
    handleScroll: false,
    autoSize: true,
  })

  createTextWatermark(chart.panes()[0], {
    horzAlign: 'center',
    vertAlign: 'center',
    lines: [
      {
        text: 'Loading...',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 24,
      },
    ],
  })

  timeCounter = 0
  const baseTime = Math.floor(Date.now() / 1000) - 25 * 8 * 60

  for (let n = 0; n < 5; n++) {
    const color = COLORS[n % COLORS.length]!.replace('0.8', '0.15')
    const inst = chart.addSeries(LineSeries, {
      color,
      lineWidth: 2 as const,
      lastValueVisible: false,
      priceLineVisible: false,
      priceScaleId: 'left',
    })

    const controls = cnt(timeCounter, n)
    inst.setData(inter(controls, baseTime) as any)
    seriesList.push(inst)
  }

  chart.timeScale().fitContent()

  interval = setInterval(() => {
    if (!chart) return
    timeCounter += 0.6
    for (let n = 0; n < 5; n++) {
      const controls = cnt(timeCounter, n)
      seriesList[n]!.setData(inter(controls, baseTime) as any)
    }
  }, 120)
}

let unmounted = false

onMounted(() => {
  if (!unmounted) createChartInstance()
})

onBeforeUnmount(() => {
  unmounted = true
  if (interval) clearInterval(interval)
  chart?.remove()
  chart = null
  seriesList = []
})
</script>

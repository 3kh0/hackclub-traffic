<template>
  <div ref="wrapper" class="w-full h-full relative">
    <div ref="el" class="w-full h-full" />
    <div
      v-if="tip.visible"
      class="absolute pointer-events-none z-10 w-65 rounded-lg bg-kumo-base p-2 shadow-md outline-1 outline-kumo-line"
      :style="{ left: tip.x + 'px', top: tip.y + 'px' }"
    >
      <div class="mb-1 text-xs font-semibold text-kumo-default">{{ tip.time }}</div>
      <div v-for="item in tip.items" :key="item.name" class="flex items-center justify-between gap-4 py-0.5">
        <div class="flex min-w-0 items-center gap-2">
          <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: item.color }" />
          <span class="truncate text-xs font-medium text-kumo-default">{{ item.name }}</span>
        </div>
        <span class="shrink-0 text-xs font-semibold text-kumo-default tabular-nums">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ISeriesApi } from 'lightweight-charts'

import type { Metric } from '~/composables/useMetric'
import { fmt, byteScale } from '~/utils/format'
import { COLORS } from '~/utils/palette'
import { DASHED, fmtTime } from '~/utils/chart'
import type { LW } from '~/composables/useChart'

type Series = { name: string; data: { time: string | number; value: number }[]; color: string }

const props = defineProps<{
  series: Series[]
  metric?: Metric
  span?: number
}>()

const wrapper = ref<HTMLElement>()
const el = ref<HTMLElement>()
let lines: ISeriesApi<'Line'>[] = []
let pending: (ISeriesApi<'Line'> | null)[] = []
let lw: LW
let scale = { div: 1, unit: 'B' }

const tip = reactive({
  visible: false,
  x: 0,
  y: 0,
  time: '',
  items: [] as { name: string; color: string; value: string }[],
})
const bytes = () => props.metric === 'bytes'
const colorOf = (s: Series, i: number) => s.color || COLORS[i % COLORS.length]!

function fmtVal(v: number) {
  if (bytes()) return fmt(v * scale.div)
  if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(2) + 'k'
  return v.toFixed(0)
}

const chart = useChart(
  el,
  (c, m) => {
    lw = m
    c.applyOptions({ leftPriceScale: { scaleMargins: { top: 0.15, bottom: 0.1 } } })
    lines = []
    pending = []
    c.subscribeCrosshairMove((p) => {
      if (!p.time || !p.seriesData.size) return (tip.visible = false)
      tip.items = lines.flatMap((l, i) => {
        const d: any = p.seriesData.get(l) ?? (pending[i] ? p.seriesData.get(pending[i]!) : undefined)
        const s = props.series[i]!
        return d?.value === undefined ? [] : [{ name: s.name, color: colorOf(s, i), value: fmtVal(d.value) }]
      })
      Object.assign(tip, { visible: true, time: fmtTime(p.time as number, props.span) })
      const r = wrapper.value?.getBoundingClientRect()
      if (p.point && r) {
        const x = p.point.x + 56
        const y = p.point.y - (40 + tip.items.length * 22) / 2
        tip.x = x + 260 > r.width ? r.width - 270 : x
        tip.y = y < 0 ? 10 : y
      }
    })
    update()
  },
  [() => props.metric, () => props.span],
)

function update() {
  const c = chart()
  if (!c) return
  for (const s of [...lines, ...pending]) if (s) c.removeSeries(s)
  lines = []
  pending = []
  scale = bytes()
    ? byteScale(Math.max(0, ...props.series.flatMap((s) => s.data.map((d) => d.value))))
    : { div: 1, unit: 'B' }

  props.series.forEach((s, i) => {
    const opts = {
      color: colorOf(s, i),
      lineWidth: 2 as const,
      priceScaleId: 'left',
      priceFormat: {
        type: 'custom' as const,
        minMove: 1,
        formatter: (v: number) => {
          if (bytes()) return parseFloat(v.toFixed(2)) + ' ' + scale.unit
          if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
          if (v >= 1e3) return (v / 1e3).toFixed(0) + 'k'
          return v.toFixed(0)
        },
      },
      lastValueVisible: false,
      priceLineVisible: false,
      autoscaleInfoProvider: (original: () => any) => {
        const res = original()
        if (res?.priceRange.minValue < 0) res.priceRange.minValue = 0
        return res
      },
    }
    const data = s.data.map((d) => ({ time: d.time, value: d.value / scale.div })) as any[]
    const line = c.addSeries(lw.LineSeries, opts)
    line.setData(data.length >= 2 ? data.slice(0, -1) : data)
    lines.push(line)
    let p: ISeriesApi<'Line'> | null = null
    if (data.length >= 2) (p = c.addSeries(lw.LineSeries, { ...opts, lineStyle: DASHED })).setData(data.slice(-2))
    pending.push(p)
  })
}

watch(
  () => props.series,
  () => (update(), chart()?.timeScale().fitContent()),
  { deep: true },
)
</script>

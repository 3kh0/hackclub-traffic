<template>
  <div ref="wrapper" class="w-full h-full relative">
    <div ref="el" class="w-full h-full" />
    <div
      v-if="tooltip.visible"
      class="absolute pointer-events-none z-10 min-w-[150px] max-w-xs rounded-lg bg-kumo-base p-2 shadow-md outline-1 outline-kumo-line"
      :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
    >
      <div class="mb-1 text-xs font-semibold text-kumo-default">{{ tooltip.time }}</div>
      <div class="flex items-center justify-between gap-4 py-0.5">
        <div class="flex min-w-0 items-center gap-2">
          <span class="h-3 w-3 shrink-0 rounded-full" :style="{ backgroundColor: lineColor }" />
          <span v-if="name" class="truncate text-xs font-medium text-kumo-default">{{ name }}</span>
        </div>
        <span class="shrink-0 text-xs font-semibold text-kumo-default tabular-nums">{{ tooltip.value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ISeriesApi } from 'lightweight-charts'

import type { Metric } from '~/composables/useMetric'
import { fmt, fmtNum, byteScale } from '~/utils/format'
import { CHART, alpha } from '~/utils/palette'
import { DASHED, fmtTime } from '~/utils/chart'
import type { LW } from '~/composables/useChart'

type Point = { time: string | number; value: number }

const props = defineProps<{
  data: Point[]
  color?: string
  name?: string
  metric?: Metric
  span?: number
}>()

const lineColor = computed(() => props.color ?? CHART.blue)
const wrapper = ref<HTMLElement>()
const el = ref<HTMLElement>()
let series: ISeriesApi<'Area'> | null = null
let pending: ISeriesApi<'Area'> | null = null
let lw: LW
let scale = { div: 1, unit: 'B' }

const tooltip = reactive({ visible: false, x: 0, y: 0, time: '', value: '' })
const bytes = () => props.metric === 'bytes'

const opts = () => ({
  lineColor: lineColor.value,
  topColor: alpha(lineColor.value, 0.4),
  bottomColor: alpha(lineColor.value, 0),
  lineWidth: 2 as const,
  priceScaleId: 'left',
  priceFormat: {
    type: 'custom' as const,
    formatter: (v: number) => (bytes() ? parseFloat(v.toFixed(2)) + ' ' + scale.unit : fmtNum(v)),
  },
  lastValueVisible: false,
  priceLineVisible: false,
})

const chart = useChart(
  el,
  (c, m) => {
    lw = m
    pending = null
    series = c.addSeries(m.AreaSeries, {
      ...opts(),
      autoscaleInfoProvider: () => {
        const d = props.data.length >= 2 ? props.data.slice(0, -1) : props.data
        return { priceRange: { minValue: 0, maxValue: Math.max(...d.map((p) => p.value / scale.div)) } }
      },
    })
    c.subscribeCrosshairMove((p) => {
      const d: any = p.time && (p.seriesData.get(series!) ?? (pending ? p.seriesData.get(pending) : undefined))
      if (d?.value === undefined) return (tooltip.visible = false)
      Object.assign(tooltip, {
        visible: true,
        value: bytes() ? fmt(d.value * scale.div) : fmtNum(d.value),
        time: fmtTime(p.time as number, props.span),
      })
      const r = wrapper.value?.getBoundingClientRect()
      if (p.point && r) {
        const x = p.point.x + c.priceScale('left').width() + 12
        tooltip.x = x + 180 > r.width ? r.width - 190 : x
        tooltip.y = Math.max(0, p.point.y - 28)
      }
    })
    update()
  },
  [() => props.metric, () => props.span],
)

function update() {
  if (!series) return
  scale = bytes() ? byteScale(Math.max(0, ...props.data.map((d) => d.value))) : { div: 1, unit: 'B' }
  const data = props.data.map((d) => ({ time: d.time, value: d.value / scale.div })) as any[]
  series.setData(data.length >= 2 ? data.slice(0, -1) : data)
  if (data.length < 2) return pending?.setData([])
  pending ??= chart()!.addSeries(lw.AreaSeries, { ...opts(), lineStyle: DASHED })
  pending.setData(data.slice(-2))
}

watch(
  () => props.data,
  () => (update(), chart()?.timeScale().fitContent()),
  { deep: true },
)
</script>

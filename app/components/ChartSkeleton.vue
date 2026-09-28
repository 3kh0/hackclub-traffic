<!-- port of kumo's ChartSkeletonLoader: a static wave with a moving shimmer -->
<script setup lang="ts">
const W = 400
const H = 320
const SAMPLES = 80

const uid = useId()
const fillId = `${uid}-fill`
const shineId = `${uid}-shine`
const clipId = `${uid}-clip`

const wave = (t: number) => 0.45 * Math.sin(3 * t) + 0.3 * Math.sin(5 * t + 0.9) + 0.25 * Math.sin(7 * t + 2.1)

const amp = Math.min(H * 0.18, 40)
const lineD = Array.from({ length: SAMPLES + 1 }, (_, i) => {
  const x = (i / SAMPLES) * W
  const y = H / 2 - wave((x / W) * 2 * Math.PI) * amp
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
}).join(' ')
const areaD = `${lineD} L${W},${H} L0,${H} Z`
</script>

<template>
  <div role="status" aria-label="Loading chart" class="chart-skeleton relative h-full w-full overflow-hidden">
    <svg
      aria-hidden="true"
      width="100%"
      height="100%"
      :viewBox="`0 0 ${W} ${H}`"
      preserveAspectRatio="none"
      class="block"
    >
      <defs>
        <linearGradient :id="fillId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="currentColor" style="stop-opacity: var(--sk-fill)" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
        <linearGradient :id="shineId" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="currentColor" stop-opacity="0" />
          <stop offset="50%" stop-color="currentColor" style="stop-opacity: var(--sk-shine)" />
          <stop offset="100%" stop-color="currentColor" stop-opacity="0" />
        </linearGradient>
        <clipPath :id="clipId">
          <path :d="areaD" />
        </clipPath>
      </defs>
      <path :d="areaD" :fill="`url(#${fillId})`" stroke="none" />
      <path
        :d="lineD"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        vector-effect="non-scaling-stroke"
        class="opacity-(--sk-stroke)"
      />
      <g :clip-path="`url(#${clipId})`">
        <rect class="kumo-chart-shimmer" x="0" y="0" :width="W" :height="H" :fill="`url(#${shineId})`" />
      </g>
    </svg>
  </div>
</template>

<style>
.chart-skeleton {
  color: #dddddd;
  --sk-stroke: 0.6;
  --sk-fill: 0.1;
  --sk-shine: 0.24;
}

[data-mode='dark'] .chart-skeleton {
  color: #5c5c5c;
  --sk-stroke: 0.36;
  --sk-fill: 0.07;
  --sk-shine: 0.16;
}
</style>

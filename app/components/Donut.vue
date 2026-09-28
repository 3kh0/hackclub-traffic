<script setup lang="ts">
import { share } from '~/utils/format'

const props = withDefaults(
  defineProps<{
    segments: { label: string; value: number; color: string }[]
    size?: number
  }>(),
  { size: 160 },
)

const ps = computed(() => {
  const t = props.segments.reduce((s, seg) => s + seg.value, 0)
  let end = 0
  return props.segments.map((seg) => {
    const pct = t > 0 ? (seg.value / t) * 100 : 0
    const start = end
    end += pct
    return { ...seg, pct: Math.round(pct * 10) / 10, pctl: share(seg.value, t), start, end }
  })
})

const gs = computed(() => `conic-gradient(${ps.value.map((s) => `${s.color} ${s.start}% ${s.end}%`).join(', ')})`)
const top = computed(() => ps.value.reduce((a, b) => (a.pct > b.pct ? a : b), { pct: 0, label: '' }))
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-4">
    <div class="relative rounded-full" :style="{ width: size + 'px', height: size + 'px', background: gs }">
      <div class="absolute inset-0 flex items-center justify-center">
        <div
          class="flex flex-col items-center justify-center rounded-full bg-kumo-base"
          :style="{ width: size - 40 + 'px', height: size - 40 + 'px' }"
        >
          <span class="text-2xl leading-none font-semibold text-kumo-strong tabular-nums">{{ top.pct }}%</span>
          <span class="mt-1 text-xs text-kumo-subtle">{{ top.label }}</span>
        </div>
      </div>
    </div>
    <div class="flex max-w-md flex-row flex-wrap items-center justify-center gap-x-4 gap-y-2">
      <div v-for="seg in ps" :key="seg.label" class="flex items-center gap-2 text-xs">
        <span class="inline-block size-2 shrink-0 rounded-full" :style="{ backgroundColor: seg.color }" />
        <span class="text-kumo-subtle">{{ seg.label }}</span>
        <span class="font-medium text-kumo-default tabular-nums">{{ seg.pctl }}%</span>
      </div>
    </div>
  </div>
</template>

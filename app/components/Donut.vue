<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  segments: { label: string; value: number; color: string }[]
  size?: number
}>(), {
  size: 160,
})

const total = computed(() => props.segments.reduce((s, seg) => s + seg.value, 0))

const ps = computed(() => {
  let cul = 0
  return props.segments.map(seg => {
    const pct = total.value > 0 ? (seg.value / total.value) * 100 : 0
    const pctl =
      total.value > 0 && (seg.value / total.value) * 100 < 0.1
      ? '<0.1'
      : Math.round((seg.value / total.value) * 1000) / 10
    const start = cul
    cul += pct
    return { ...seg, pct: Math.round(pct * 10) / 10, pctl, start, end: cul }
  })
})

const gs = computed(() => {
  return `conic-gradient(${ps.value.map(s => `${s.color} ${s.start}% ${s.end}%`).join(', ')})`
})

const tp = computed(() => {
  return ps.value.reduce((a, b) => a.pct > b.pct ? a : b, { pct: 0 } as { pct: number }).pct
})

const tl = computed(() => {
  return ps.value.reduce((a, b) => a.pct > b.pct ? a : b, { pct: 0, label: '' } as { pct: number; label: string }).label
})
</script>

<template>
  <div class="flex flex-col items-center gap-3 justify-center h-full">
    <div class="relative rounded-full" :style="{ width: size + 'px', height: size + 'px', background: gs }">
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="rounded-full bg-background flex flex-col items-center justify-center"
             :style="{ width: (size - 48) + 'px', height: (size - 48) + 'px' }">
          <span class="text-main text-2xl font-bold font-mono">{{ tp }}%</span>
          <span class="text-subtext text-xs font-mono">{{ tl }}</span>
        </div>
      </div>
    </div>
    <div class="flex flex-row flex-wrap items-center gap-2 justify-center my-4 max-w-md">
      <div v-for="seg in ps" :key="seg.label" class="flex items-center gap-1.5 text-xs">
        <div class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: seg.color }" />
        <span class="text-subtext">{{ seg.label }}</span>
        <span class="text-main font-mono">{{ seg.pctl }}%</span>
      </div>
    </div>
  </div>
</template>

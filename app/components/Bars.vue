<script setup lang="ts">
import { fmtNum } from '~/utils/format'

const props = withDefaults(defineProps<{
  items: { label: string; value: number; formatted?: string }[]
  color?: string
  max?: number
}>(), {
  max: 10,
})

const t = computed(() => props.items.reduce((s, i) => s + i.value, 0))

const items = computed(() =>
  props.items.slice(0, props.max).map(item => ({
    ...item,
    pct: t.value > 0 ? Math.round((item.value / t.value) * 1000) / 10 : 0,
    pctl:
      t.value > 0 && (item.value / t.value) * 100 < 0.1
      ? '<0.1'
      : Math.round((item.value / t.value) * 1000) / 10,
  }))
)
</script>

<template>
  <div class="space-y-2">
    <div v-for="item in items" :key="item.label">
      <div class="flex items-center justify-between text-xs mb-0.5">
        <span class="text-main text-sm font-bold font-mono truncate flex-1 mr-3">{{ item.label }}</span>
        <span class="text-subtext font-mono shrink-0">{{ item.formatted || fmtNum(item.value) }} <span class="text-subtext/60">({{ item.pctl }}%)</span></span>
      </div>
      <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-500" :style="{ width: item.pct + '%', backgroundColor: item.color ?? color ?? 'rgb(70, 147, 255)' }" />
      </div>
    </div>
  </div>
</template>

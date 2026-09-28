<script setup lang="ts">
import { fmtNum, share } from '~/utils/format'
import { CHART } from '~/utils/palette'

const props = withDefaults(
  defineProps<{
    items: { label: string; value: number; formatted?: string; color?: string }[]
    color?: string
    max?: number
  }>(),
  { max: 10 },
)

const rows = computed(() => {
  const t = props.items.reduce((s, i) => s + i.value, 0)
  return props.items
    .slice(0, props.max)
    .map((i) => ({ ...i, pct: t > 0 ? Math.round((i.value / t) * 1000) / 10 : 0, pctl: share(i.value, t) }))
})
</script>

<!-- rows styled after kumo's Meter -->
<template>
  <div class="flex flex-col gap-4">
    <div v-for="item in rows" :key="item.label" class="flex w-full flex-col gap-2">
      <div class="flex items-center justify-between gap-4">
        <span class="min-w-0 flex-1 truncate text-xs text-kumo-subtle" :title="item.label">{{ item.label }}</span>
        <span class="shrink-0 text-sm font-medium text-kumo-default tabular-nums">
          {{ item.formatted || fmtNum(item.value) }}
          <span class="font-normal text-kumo-subtle">({{ item.pctl }}%)</span>
        </span>
      </div>
      <div class="relative h-2 w-full overflow-hidden rounded-full bg-kumo-fill">
        <div
          class="absolute inset-y-0 left-0 rounded-full transition-[width] duration-300 ease-out"
          :style="{ width: item.pct + '%', backgroundColor: item.color ?? color ?? CHART.blue }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string
  trend?: number
}>()
</script>

<template>
  <LayerCard :title="label">
    <div class="flex items-baseline justify-between gap-2">
      <span class="text-2xl leading-tight font-semibold text-kumo-strong tabular-nums">{{ value }}</span>
      <span
        v-if="trend !== undefined"
        class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
        :class="trend >= 0 ? 'bg-kumo-success-tint text-kumo-success' : 'bg-kumo-danger-tint text-kumo-danger'"
      >
        {{ trend >= 0 ? '↑' : '↓' }} {{ Math.abs(trend).toFixed(1) }}%
      </span>
    </div>
  </LayerCard>
</template>

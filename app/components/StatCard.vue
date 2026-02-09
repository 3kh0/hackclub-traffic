<script setup lang="ts">
defineProps<{
  label: string
  value: string
  trend?: number
  icon?: string
}>()
</script>

<template>
  <div class="border border-white/10 px-5 py-4 bg-white/2">
    <div class="text-subtext text-xs font-medium uppercase tracking-wider">{{ label }}</div>
    <div class="text-main text-3xl font-bold font-mono mt-1">{{ value }}</div>
    <div v-if="trend !== undefined" class="flex items-center gap-1 mt-1 text-xs font-medium" :class="trend >= 0 ? 'text-up' : 'text-down'">
      <span>{{ trend >= 0 ? '↑' : '↓' }}</span>
      <span>{{ Math.abs(trend).toFixed(1) }}%</span>
    </div>
  </div>
</template>

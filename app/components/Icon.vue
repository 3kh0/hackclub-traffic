<!-- phosphor icon without the vue package's six-weights-per-icon payload -->
<script setup lang="ts">
import { ICONS, type IconName, type IconWeight } from '~/utils/icons'

withDefaults(defineProps<{ name: IconName; size?: number; weight?: IconWeight }>(), { size: 16, weight: 'regular' })
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 256 256"
    fill="currentColor"
    aria-hidden="true"
    v-html="(ICONS[name] as Partial<Record<IconWeight, string>>)[weight]"
  />
</template>

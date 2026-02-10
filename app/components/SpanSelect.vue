<template>
  <select
    :value="modelValue"
    @change="$emit('update:modelValue', Number(($event.target as HTMLSelectElement).value))"
    class="bg-white/2 border border-white/10 px-2 py-1 text-xs text-subtext hover:text-main cursor-pointer focus:outline-none focus:border-white/25 appearance-none"
  >
    <option v-for="(label, id) in SPANS" :key="id" :value="Number(id)" :selected="Number(id) === modelValue" class="bg-[#111]">{{ label }}</option>
  </select>
</template>

<script setup lang="ts">
import { SPANS } from '~/composables/useSpan'

defineProps<{ modelValue: number }>()
defineEmits<{ 'update:modelValue': [value: number] }>()
</script>

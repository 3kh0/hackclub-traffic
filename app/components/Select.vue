<!-- native select styled as kumo's Select trigger -->
<script setup lang="ts" generic="T extends string | number">
const props = defineProps<{
  modelValue: T
  options: { value: T; label: string }[]
  label: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: T] }>()

function onChange(e: Event) {
  emit('update:modelValue', props.options[(e.target as HTMLSelectElement).selectedIndex]!.value)
}
</script>

<template>
  <div class="relative flex items-center">
    <span v-if="$slots.icon" class="pointer-events-none absolute left-2.5 flex text-kumo-subtle">
      <slot name="icon" />
    </span>
    <select
      :value="modelValue"
      :aria-label="label"
      data-kumo-component="Select"
      class="h-9 w-full cursor-pointer appearance-none rounded-lg border-0 bg-kumo-control pr-8 text-base font-normal text-kumo-default shadow-xs ring ring-kumo-line focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
      :class="$slots.icon ? 'pl-8' : 'pl-3'"
      @change="onChange"
    >
      <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
    </select>
    <Icon name="caret-up-down" :size="16" class="pointer-events-none absolute right-2.5 text-kumo-subtle" />
  </div>
</template>

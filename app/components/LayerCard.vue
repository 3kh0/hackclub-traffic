<!-- vue port of kumo's LayerCard with Secondary (header) + Primary (body) layers -->
<script setup lang="ts">
defineProps<{
  title?: string
  flush?: boolean
}>()
</script>

<template>
  <section class="flex w-full flex-col overflow-hidden rounded-lg bg-kumo-elevated text-base ring ring-kumo-hairline">
    <header
      v-if="title || $slots.actions"
      class="-my-2 flex min-h-13 items-center gap-2 bg-kumo-elevated p-4 text-base font-medium text-kumo-subtle"
    >
      <h2 class="min-w-0 flex-1 truncate">{{ title }}</h2>
      <slot name="actions" />
    </header>
    <div
      class="relative flex flex-col gap-2 overflow-hidden rounded-lg bg-kumo-base ring ring-kumo-fill"
      :class="flush ? 'p-0' : 'p-4'"
    >
      <slot />
    </div>
  </section>
</template>

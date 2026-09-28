<!-- kumo Banner, error variant -->
<template>
  <div role="alert" class="flex items-start gap-3 rounded-lg bg-kumo-danger-tint px-4 py-3 text-base text-kumo-danger">
    <Icon name="warning-circle" :size="20" weight="fill" class="shrink-0 fill-kumo-danger" />
    <span class="leading-snug"><slot /></span>
  </div>
</template>

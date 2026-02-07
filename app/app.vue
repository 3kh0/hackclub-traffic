<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import 'nprogress/nprogress.css'

usePageLoading()
</script>

<style>
#nprogress .bar {
  background: var(--color-graph);
}

#nprogress .peg {
  box-shadow: 0 0 10px var(--color-graph), 0 0 5px var(--color-graph);
}
</style>

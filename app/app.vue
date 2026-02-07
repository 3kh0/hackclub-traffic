<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

NProgress.configure({ minimum: 0.1, trickleSpeed: 100 })

const app = useNuxtApp()

app.hook('page:start', () => { NProgress.start() })
app.hook('page:finish', () => { NProgress.done() })
</script>

<style>
#nprogress .bar {
  background: var(--color-graph);
}

#nprogress .peg {
  box-shadow: 0 0 10px var(--color-graph), 0 0 5px var(--color-graph);
}
</style>

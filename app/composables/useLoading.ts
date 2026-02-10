import { watch, useNuxtApp, type Ref } from '#imports'
import NProgress from 'nprogress'

export function useLoading(pending: Ref<boolean>) {
  watch(pending, (p) => {
    if (import.meta.client) {
      NProgress.configure({ minimum: 0.1, trickleSpeed: 100 })
      if (p) NProgress.start()
      else NProgress.done()
    }
  })
}

export function usePageLoading() {
  if (import.meta.client) {
    NProgress.configure({ minimum: 0.1, trickleSpeed: 100 })
  }

  const app = useNuxtApp()
  app.hook('page:start', () => { NProgress.start() })
  app.hook('page:finish', () => { NProgress.done() })
}

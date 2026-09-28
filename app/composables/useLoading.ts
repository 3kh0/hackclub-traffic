import { watch, useNuxtApp, type Ref } from '#imports'
import NProgress from 'nprogress'

if (import.meta.client) NProgress.configure({ minimum: 0.1, trickleSpeed: 100 })

export function useLoading(pending: Ref<boolean>) {
  watch(pending, (p) => import.meta.client && (p ? NProgress.start() : NProgress.done()))
}

export function usePageLoading() {
  const app = useNuxtApp()
  app.hook('page:start', () => void NProgress.start())
  app.hook('page:finish', () => void NProgress.done())
}

export const SPANS: Record<number, string> = {
  1: 'Last 30 minutes',
  2: 'Last 6 hours',
  3: 'Last 12 hours',
  4: 'Last 24 hours',
  5: 'Last 3 days',
  6: 'Last 7 days',
  7: 'Last 30 days',
}

export function useSpan() {
  const route = useRoute()
  const router = useRouter()

  const span = computed<number>({
    get: () => {
      const s = Number(route.query.s)
      return s >= 1 && s <= 7 ? s : 7
    },
    set: (val: number) => {
      router.replace({ query: { ...route.query, s: val } })
    },
  })

  return span
}

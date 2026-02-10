import { computed, useRoute, useRouter } from '#imports'
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
  const r = useRoute()
  return computed<number>({
    get: () => { const v = Number(r.query.span); return v >= 1 && v <= 7 ? v : 7 },
    set: (v: number) => useRouter().replace({ query: { ...r.query, span: v } }),
  })
}

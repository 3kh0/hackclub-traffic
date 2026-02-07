export default defineEventHandler(async (event) => {
  const s = getSpan(spanParam(event))
  const { now, since } = useSpan(s)

  const q = `
    query ($zoneTag: string, $filter: ${s.filterType}) {
      viewer { zones(filter: { zoneTag: $zoneTag }) {
        data: ${s.dataset}(limit: ${s.limit}, filter: $filter, orderBy: [${s.orderBy}]) {
          sum { requests bytes pageViews }
          dimensions { ts: ${s.datetimeField} }
        }
      }}
    }`

  const r = await cfQuery(q, {
    zoneTag: useRuntimeConfig().cfzone,
    filter: baseFilter(since, now, s.datetimeField === 'date'),
  })
  return { data: r.data?.viewer?.zones?.[0]?.data ?? [] }
})

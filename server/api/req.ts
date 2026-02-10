export default defineEventHandler(async (event) => {
  const s = getSpan(spanParam(event))
  const { now, since } = spanRange(s)

  const sumFields = s.adaptive ? 'edgeResponseBytes visits' : 'requests bytes pageViews'
  const countField = s.adaptive ? 'count' : ''
  const filter = s.adaptive ? adaptiveFilter(since, now) : baseFilter(since, now, s.datetimeField === 'date')

  const q = `
    query ($zoneTag: string, $filter: ${s.filterType}) {
      viewer { zones(filter: { zoneTag: $zoneTag }) {
        data: ${s.dataset}(limit: ${s.limit}, filter: $filter, orderBy: [${s.orderBy}]) {
          ${countField}
          sum { ${sumFields} }
          dimensions { ts: ${s.datetimeField} }
        }
      }}
    }`

  const r = await cfQuery(q, {
    zoneTag: useRuntimeConfig().cfzone,
    filter,
  })

  let data = r.data?.viewer?.zones?.[0]?.data ?? []
  if (s.adaptive) {
    data = data.map((d: any) => ({
      sum: { requests: d.count, bytes: d.sum.edgeResponseBytes, pageViews: d.sum.visits },
      dimensions: d.dimensions,
    }))
  }
  return { data }
})

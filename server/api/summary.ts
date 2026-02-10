export default defineEventHandler(async (event) => {
  const s = getSpan(spanParam(event))
  const { now, since } = spanRange(s)
  const filter = adaptiveFilter(since, now)
  const zoneTag = useRuntimeConfig().cfzone

  const q = `
    query ($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject) {
      viewer { scope: zones(filter: {zoneTag: $zoneTag}) {
        totals: httpRequestsAdaptiveGroups(limit: 10000, filter: $filter) {
          count
          sum { edgeResponseBytes visits }
        }
        cache: httpRequestsAdaptiveGroups(limit: 50, filter: $filter, orderBy: [count_DESC]) {
          count
          dimensions { metric: cacheStatus }
        }
      }}
    }`

  const r = await cfQuery(q, { zoneTag, filter })
  const d = scope(r)

  const totals = d?.totals ?? []
  let totalRequests = 0, totalBytes = 0, totalVisits = 0
  for (const t of totals) {
    totalRequests += t.count
    totalBytes += t.sum.edgeResponseBytes
    totalVisits += t.sum.visits
  }

  const cacheData = d?.cache ?? []
  let cacheHits = 0, cacheTotal = 0
  for (const c of cacheData) {
    cacheTotal += c.count
    if (c.dimensions.metric === 'hit') cacheHits += c.count
  }

  return {
    totalRequests,
    totalBytes,
    totalVisits,
    cacheHitRatio: cacheTotal > 0 ? cacheHits / cacheTotal : 0,
  }
})

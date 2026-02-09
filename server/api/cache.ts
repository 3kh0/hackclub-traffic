export default defineEventHandler(async (event) => {
  const s = getSpan(spanParam(event))
  const { now, since } = useSpan(s)
  const f = adaptiveFilter(since, now)
  const z = useRuntimeConfig().cfzone
  const tsDim = s.adaptiveDimension

  const q = `
    query ($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject) {
      viewer { scope: zones(filter: {zoneTag: $zoneTag}) {
        byStatus: httpRequestsAdaptiveGroups(limit: 50, filter: $filter, orderBy: [count_DESC]) {
          count
          sum { edgeResponseBytes }
          dimensions { metric: cacheStatus }
        }
        timeline: httpRequestsAdaptiveGroups(limit: 10000, filter: $filter, orderBy: [${tsDim}_ASC]) {
          count
          sum { edgeResponseBytes }
          dimensions { metric: cacheStatus ts: ${tsDim} }
        }
      }}
    }`

  const r = await cfQuery(q, { zoneTag: z, filter: f })
  const d = scope(r)

  const byStatus = (d?.byStatus ?? []).map((e: any) => ({
    status: e.dimensions.metric,
    count: e.count,
    bytes: e.sum.edgeResponseBytes,
  }))

  const timeline = (d?.timeline ?? []).map((e: any) => ({
    ts: e.dimensions.ts,
    status: e.dimensions.metric,
    count: e.count,
    bytes: e.sum.edgeResponseBytes,
  }))

  const totalCount = byStatus.reduce((s: number, e: any) => s + e.count, 0)
  const hitEntries = byStatus.filter((e: any) => e.status === 'hit')
  const hitCount = hitEntries.reduce((s: number, e: any) => s + e.count, 0)
  const savedBytes = hitEntries.reduce((s: number, e: any) => s + e.bytes, 0)

  return {
    timeline,
    byStatus,
    hitRatio: totalCount ? hitCount / totalCount : 0,
    savedBytes,
  }
})

export default defineEventHandler(async (event) => {
  const s = getSpan(spanParam(event))
  const { now, since } = spanRange(s)
  const f = adaptiveFilter(since, now)
  const zoneTag = useRuntimeConfig().cfzone
  const tsDim = s.adaptiveDimension

  const q = `
    query ($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject) {
      viewer { scope: zones(filter: {zoneTag: $zoneTag}) {
        statusCodes: httpRequestsAdaptiveGroups(limit: 500, filter: $filter, orderBy: [count_DESC]) {
          count
          dimensions { metric: edgeResponseStatus }
        }
        timeSeries: httpRequestsAdaptiveGroups(limit: 10000, filter: $filter, orderBy: [${tsDim}_ASC]) {
          count
          avg { edgeTimeToFirstByteMs originResponseDurationMs }
          sum { edgeResponseBytes }
          dimensions { ts: ${tsDim} }
        }
      }}
    }`

  const r = await cfQuery(q, { zoneTag, filter: f })
  const d = scope(r)

  const buckets: Record<string, number> = { '2xx': 0, '3xx': 0, '4xx': 0, '5xx': 0 }
  let total = 0
  for (const e of d?.statusCodes ?? []) {
    const cat = Math.floor(e.dimensions.metric / 100)
    const key = `${cat}xx`
    if (key in buckets) buckets[key] += e.count
    total += e.count
  }

  const statusCodes = Object.entries(buckets).map(([status, count]) => ({ status, count }))
  const errors = (buckets['4xx'] ?? 0) + (buckets['5xx'] ?? 0)
  const errorRate = total > 0 ? errors / total : 0

  const ttfb = (d?.timeSeries ?? []).map((e: any) => ({
    ts: e.dimensions.ts,
    value: e.avg.edgeTimeToFirstByteMs,
  }))

  const originTime = (d?.timeSeries ?? []).map((e: any) => ({
    ts: e.dimensions.ts,
    value: e.avg.originResponseDurationMs,
  }))

  return { statusCodes, ttfb, originTime, errorRate }
})

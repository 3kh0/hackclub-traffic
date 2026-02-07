export default defineEventHandler(async () => {
  const { now, since } = last30Days()
  const filter = baseFilter(since, now)
  const zoneTag = useRuntimeConfig().cfzone

  const tq = `
    query Top($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject) {
      viewer { scope: zones(filter: {zoneTag: $zoneTag}) {
        topCountries: httpRequestsAdaptiveGroups(limit: 50, filter: $filter, orderBy: [count_DESC]) {
          count
          sum { edgeResponseBytes visits }
          dimensions { metric: clientCountryName }
        }
      }}
    }`

  const topData = await cfQuery(tq, { zoneTag, filter })
  const regions = new Intl.DisplayNames(['en'], { type: 'region' })
  const top = (scope(topData)?.topCountries ?? []).map((e: any) => ({
    country: regions.of(e.dimensions.metric) ?? e.dimensions.metric,
    countryCode: e.dimensions.metric,
    totalRequests: e.count,
    totalBytes: e.sum.edgeResponseBytes,
    totalVisits: e.sum.visits,
  }))

  if (!top.length) return { countries: [] }

  const codes = top.map((c: any) => c.countryCode)

  const dq = `
    query Daily($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject) {
      viewer { scope: zones(filter: {zoneTag: $zoneTag}) {
        series: httpRequestsAdaptiveGroups(limit: 5000, filter: $filter) {
          count
          sum { edgeResponseBytes visits }
          dimensions { metric: clientCountryName ts: date }
        }
      }}
    }`

  const dailyData = await cfQuery(dq, {
    zoneTag,
    filter: { AND: [...filter.AND, { OR: codes.map((c: string) => ({ clientCountryName: c })) }] },
  })

  const dm = bmap(scope(dailyData)?.series ?? [])
  return { countries: attachDaily(top, 'countryCode', dm) }
})

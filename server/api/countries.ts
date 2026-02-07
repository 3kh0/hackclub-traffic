export default defineEventHandler(async (event) => {
  const s = getSpan(spanParam(event))
  const { now, since } = useSpan(s)
  const f = adaptiveFilter(since, now)
  const z = useRuntimeConfig().cfzone
  const regions = new Intl.DisplayNames(['en'], { type: 'region' })

  const tq = `
    query ($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject) {
      viewer { scope: zones(filter: {zoneTag: $zoneTag}) {
        top: httpRequestsAdaptiveGroups(limit: 50, filter: $filter, orderBy: [count_DESC]) {
          count
          sum { edgeResponseBytes visits }
          dimensions { metric: clientCountryName }
        }
      }}
    }`

  const td = await cfQuery(tq, { zoneTag: z, filter: f })
  const top = (scope(td)?.top ?? []).map((e: any) => ({
    country: regions.of(e.dimensions.metric) ?? e.dimensions.metric,
    countryCode: e.dimensions.metric,
    totalRequests: e.count,
    totalBytes: e.sum.edgeResponseBytes,
    totalVisits: e.sum.visits,
  }))
  if (!top.length) return { countries: [] }

  const codes = top.map((c: any) => c.countryCode)
  const tsDim = s.adaptiveDimension
  const dq = `
    query ($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject) {
      viewer { scope: zones(filter: {zoneTag: $zoneTag}) {
        series: httpRequestsAdaptiveGroups(limit: 10000, filter: $filter, orderBy: [${tsDim}_ASC]) {
          count
          sum { edgeResponseBytes visits }
          dimensions { metric: clientCountryName ts: ${tsDim} }
        }
      }}
    }`

  const dd = await cfQuery(dq, {
    zoneTag: z,
    filter: { AND: [...f.AND, { OR: codes.map((c: string) => ({ clientCountryName: c })) }] },
  })
  return { countries: attachDaily(top, 'countryCode', bmap(scope(dd)?.series ?? [])) }
})

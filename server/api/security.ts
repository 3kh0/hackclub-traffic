export default defineEventHandler(async (event) => {
  const s = getSpan(spanParam(event))
  const { now, since } = spanRange(s)
  const z = useRuntimeConfig().cfzone
  const regions = new Intl.DisplayNames(['en'], { type: 'region' })

  const filter = { AND: [{ datetime_geq: since.toISOString(), datetime_leq: now.toISOString() }] }
  const tsDim = s.adaptiveDimension

  const q = `
    query ($zoneTag: string, $filter: ZoneFirewallEventsAdaptiveGroupsFilter_InputObject) {
      viewer { scope: zones(filter: {zoneTag: $zoneTag}) {
        byAction: firewallEventsAdaptiveGroups(limit: 20, filter: $filter, orderBy: [count_DESC]) {
          count
          dimensions { action }
        }
        timeline: firewallEventsAdaptiveGroups(limit: 10000, filter: $filter, orderBy: [${tsDim}_ASC]) {
          count
          dimensions { action ts: ${tsDim} }
        }
        topCountries: firewallEventsAdaptiveGroups(limit: 15, filter: $filter, orderBy: [count_DESC]) {
          count
          dimensions { metric: clientCountryName }
        }
        topPaths: firewallEventsAdaptiveGroups(limit: 15, filter: $filter, orderBy: [count_DESC]) {
          count
          dimensions { metric: clientRequestPath }
        }
      }}
    }`

  const r = await cfQuery(q, { zoneTag: z, filter })
  const d = scope(r)

  const byAction = (d?.byAction ?? []).map((e: any) => ({
    action: e.dimensions.action,
    count: e.count,
  }))

  const timeline = (d?.timeline ?? []).map((e: any) => ({
    ts: e.dimensions.ts,
    action: e.dimensions.action,
    count: e.count,
  }))

  const topCountries = (d?.topCountries ?? []).map((e: any) => ({
    country: e.dimensions.metric,
    countryName: regions.of(e.dimensions.metric) ?? e.dimensions.metric,
    count: e.count,
  }))

  const topPaths = (d?.topPaths ?? []).map((e: any) => ({
    path: e.dimensions.metric,
    count: e.count,
  }))

  const total = byAction.reduce((sum: number, e: any) => sum + e.count, 0)

  return { timeline, byAction, topCountries, topPaths, total }
})

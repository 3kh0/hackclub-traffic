export default defineEventHandler(async () => {
  const { now, since } = last30Days()
  const sinceHour = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const query = `
    query GetZoneAnalytics($zoneTag: string, $dailyFilter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject, $hourlyFilter: ZoneHttpRequests1hGroupsFilter_InputObject) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          daily: httpRequestsAdaptiveGroups(limit: 60, filter: $dailyFilter, orderBy: [date_ASC]) {
            count
            sum { edgeResponseBytes visits }
            dimensions { date }
          }
          httpRequests1hGroups(limit: 24, orderBy: [datetime_ASC], filter: $hourlyFilter) {
            sum { requests bytes pageViews }
            dimensions { datetime }
          }
        }
      }
    }`

  const data = await cfQuery(query, {
    zoneTag: useRuntimeConfig().cfzone,
    dailyFilter: baseFilter(since, now),
    hourlyFilter: { datetime_geq: sinceHour.toISOString(), datetime_lt: now.toISOString() },
  })

  const zone = data.data?.viewer?.zones?.[0]
  return {
    daily: (zone?.daily ?? []).map((e: any) => ({
      dimensions: { date: e.dimensions.date },
      sum: { requests: e.count, bytes: e.sum?.edgeResponseBytes ?? 0, visits: e.sum?.visits ?? 0 },
    })),
    hourly: zone?.httpRequests1hGroups ?? [],
  }
})

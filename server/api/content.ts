export default defineEventHandler(async (event) => {
  const s = getSpan(spanParam(event))
  const { now, since } = spanRange(s)
  const filter = adaptiveFilter(since, now)
  const zoneTag = useRuntimeConfig().cfzone

  const q = `
    query ($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject) {
      viewer { scope: zones(filter: {zoneTag: $zoneTag}) {
        contentTypes: httpRequestsAdaptiveGroups(limit: 25, filter: $filter, orderBy: [count_DESC]) {
          count
          sum { edgeResponseBytes }
          dimensions { metric: edgeResponseContentTypeName }
        }
        methods: httpRequestsAdaptiveGroups(limit: 15, filter: $filter, orderBy: [count_DESC]) {
          count
          dimensions { metric: clientRequestHTTPMethodName }
        }
        protocols: httpRequestsAdaptiveGroups(limit: 10, filter: $filter, orderBy: [count_DESC]) {
          count
          dimensions { metric: clientRequestHTTPProtocol }
        }
      }}
    }`

  const r = await cfQuery(q, { zoneTag, filter })
  const s0 = scope(r)

  return {
    contentTypes: (s0?.contentTypes ?? []).map((e: any) => ({
      type: e.dimensions.metric,
      count: e.count,
      bytes: e.sum.edgeResponseBytes,
    })),
    methods: (s0?.methods ?? []).map((e: any) => ({
      method: e.dimensions.metric,
      count: e.count,
    })),
    protocols: (s0?.protocols ?? []).map((e: any) => ({
      protocol: e.dimensions.metric,
      count: e.count,
    })),
  }
})

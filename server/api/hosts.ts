export default defineEventHandler((e) =>
  fetchBreakdown({ dimension: 'clientRequestHTTPHost', topAlias: 'topHosts', topLimit: 50, key: 'host', returnKey: 'hosts', spanId: spanParam(e) })
)

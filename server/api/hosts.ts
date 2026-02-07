export default defineEventHandler(() =>
  fetchBreakdown({ dimension: 'clientRequestHTTPHost', topAlias: 'topHosts', topLimit: 50, key: 'host', returnKey: 'hosts' })
)

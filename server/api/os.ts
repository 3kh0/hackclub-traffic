export default defineEventHandler(() =>
  fetchBreakdown({ dimension: 'userAgentOS', topAlias: 'TopOSes', topLimit: 25, key: 'os', returnKey: 'oss' })
)

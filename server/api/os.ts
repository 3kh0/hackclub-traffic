export default defineEventHandler((e) =>
  fetchBreakdown({ dimension: 'userAgentOS', topAlias: 'TopOSes', topLimit: 25, key: 'os', returnKey: 'oss', spanId: spanParam(e) })
)

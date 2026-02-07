export default defineEventHandler((e) =>
  fetchBreakdown({ dimension: 'userAgentBrowser', topAlias: 'TopBrowsers', topLimit: 25, key: 'browser', returnKey: 'browsers', spanId: spanParam(e) })
)

export default defineEventHandler(() =>
  fetchBreakdown({ dimension: 'userAgentBrowser', topAlias: 'TopBrowsers', topLimit: 25, key: 'browser', returnKey: 'browsers' })
)

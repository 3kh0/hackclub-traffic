export function last30Days() {
  const now = new Date()
  const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  return { now, since }
}

export function baseFilter(since: Date, now: Date) {
  return { AND: [{ datetime_geq: since.toISOString(), datetime_leq: now.toISOString() }, { requestSource: 'eyeball' }] }
}

export async function cfQuery(query: string, variables: Record<string, any>) {
  const c = useRuntimeConfig()
  const res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers:{ 'Authorization': `Bearer ${c.cftoken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  const data = await res.json()
  if (data.errors) throw createError({ statusCode: 500, message: data.errors[0].message })
  if (!res.ok) throw createError({ statusCode: res.status, message: 'Cloudflare API error' })
  return data
}

export function scope(data: any) {
  return data.data?.viewer?.scope?.[0]
}

export function mapTop(raw: any[], key: string) {
  return raw.map((e: any) => ({
    [key]: e.dimensions.metric,
    totalRequests: e.count,
    totalBytes: e.sum.edgeResponseBytes,
    totalVisits: e.sum.visits,
  }))
}

export function bmap(raw: any[]) {
  const m: Record<string, { date: string; requests: number; bytes: number; visits: number }[]> = {}
  for (const e of raw) {
    const k = e.dimensions.metric
    ;(m[k] ??= []).push({
      date: e.dimensions.ts,
      requests: e.count,
      bytes: e.sum.edgeResponseBytes,
      visits: e.sum.visits,
    })
  }
  return m
}

export function attachDaily<T extends Record<string, any>>(items: T[], key: string, dailyMap: Record<string, any[]>) {
  return items.map(i => ({
    ...i,
    daily: (dailyMap[i[key]] ?? []).sort((a: any, b: any) => a.date.localeCompare(b.date)),
  }))
}

type BreakdownConfig = {
  dimension: string
  topAlias: string
  topLimit?: number
  dailyAlias?: string
  key: string
  returnKey: string
}

export async function fetchBreakdown(cfg: BreakdownConfig) {
  const { now, since } = last30Days()
  const filter = baseFilter(since, now)
  const zoneTag = useRuntimeConfig().cfzone

  const tq = `
    query Top($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject) {
      viewer { scope: zones(filter: {zoneTag: $zoneTag}) {
        ${cfg.topAlias}: httpRequestsAdaptiveGroups(limit: ${cfg.topLimit ?? 25}, filter: $filter, orderBy: [count_DESC]) {
          count
          sum { edgeResponseBytes visits }
          dimensions { metric: ${cfg.dimension} }
        }
      }}
    }`

  const topData = await cfQuery(tq, { zoneTag, filter })
  const top = mapTop(scope(topData)?.[cfg.topAlias] ?? [], cfg.key)
  if (!top.length) return { [cfg.returnKey]: [] }

  const names = top.map((i: any) => i[cfg.key])

  const dq = `
    query Daily($zoneTag: string, $filter: ZoneHttpRequestsAdaptiveGroupsFilter_InputObject) {
      viewer { scope: zones(filter: {zoneTag: $zoneTag}) {
        series: httpRequestsAdaptiveGroups(limit: 5000, filter: $filter) {
          count
          sum { edgeResponseBytes visits }
          dimensions { metric: ${cfg.dimension} ts: date }
        }
      }}
    }`

  const dailyData = await cfQuery(dq, {
    zoneTag,
    filter: { AND: [...filter.AND, { OR: names.map((n: string) => ({ [cfg.dimension]: n })) }] },
  })

  const dm = bmap(scope(dailyData)?.series ?? [])
  return { [cfg.returnKey]: attachDaily(top, cfg.key, dm) }
}

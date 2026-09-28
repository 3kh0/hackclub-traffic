import { ts } from './format'

type Row = { ts: string; count: number } & Record<string, any>

// one chart series per distinct value of `key`
export const toSeries = (rows: Row[], key: string, color: (k: string) => string) =>
  [...new Set(rows.map((r) => r[key] as string))].map((name) => ({
    name,
    color: color(name),
    data: rows.filter((r) => r[key] === name).map((r) => ({ time: ts(r.ts), value: r.count })),
  }))

// donut segments / bar items
export const toSlices = (rows: Record<string, any>[], key: string, color: (k: string) => string) =>
  rows.map((r) => ({ label: r[key] as string, value: r.count as number, color: color(r[key]) }))

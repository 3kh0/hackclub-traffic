const UNITS = ['B', 'KB', 'MB', 'GB', 'TB']
const unit = (n: number) => (n > 0 ? Math.floor(Math.log(n) / Math.log(1024)) : 0)

export function fmt(bytes: number) {
  const i = unit(bytes)
  return parseFloat((bytes / 1024 ** i).toFixed(2)) + ' ' + UNITS[i]
}

// divisor + unit label so a whole chart shares one byte unit
export function byteScale(max: number) {
  const i = unit(max)
  return { div: 1024 ** i, unit: UNITS[i] || 'B' }
}

export function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return n.toLocaleString()
}

export const fmtPct = (r: number) => (r * 100).toFixed(1) + '%'

// share of total, rounded to 0.1, with tiny slices shown as <0.1
export const share = (v: number, t: number) => (t > 0 && (v / t) * 100 < 0.1 ? '<0.1' : Math.round((v / t) * 1000) / 10)

export const ts = (d: string) => new Date(d).getTime() / 1000

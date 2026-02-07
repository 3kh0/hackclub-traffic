export function fmt(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return n.toLocaleString()
}

export function datefx(date: string) {
  const parts = date.split('-').map(Number)
  return (Date.UTC(parts[0]!, parts[1]! - 1, parts[2]! + 1, 0, 0, 0) / 1000) - new Date().getTimezoneOffset() * 60
}

export const COLORS = [
  "rgba(255, 90, 100, 0.8)",
  "rgba(100, 235, 80, 0.8)",
  "rgba(60, 180, 255, 0.8)",
  "rgba(255, 180, 60, 0.8)",
  "rgba(190, 90, 255, 0.8)",
  "rgba(255, 130, 200, 0.8)",
  "rgba(0, 220, 180, 0.8)",
  "rgba(255, 80, 160, 0.8)",
  "rgba(140, 255, 120, 0.8)",
  "rgba(255, 140, 255, 0.8)",
  "rgba(80, 255, 220, 0.8)",
  "rgba(255, 210, 80, 0.8)",
  "rgba(200, 120, 255, 0.8)",
  "rgba(255, 110, 80, 0.8)",
  "rgba(120, 255, 255, 0.8)"
]

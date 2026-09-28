// chart colors from kumo's ChartPalette (packages/kumo/src/components/chart/Color.ts)

export const CHART = {
  blue: '#4290F0',
  yellow: '#F5B647',
  pink: '#E8649D',
  purple: '#8D58EE',
  teal: '#50C3B6',
  orange: '#D37536',
}

export const SEMANTIC = {
  attention: '#FC574A',
  warning: '#F8A054',
  success: '#00A63E',
  disabled: '#878787',
}

// kumo's six categorical colors first, then extras so up to 15 series stay distinct
export const COLORS = [
  CHART.blue,
  CHART.yellow,
  CHART.pink,
  CHART.purple,
  CHART.teal,
  CHART.orange,
  '#3FAE6A',
  '#E5484D',
  '#5B6CF0',
  '#9BC53D',
  '#C356D6',
  '#3BB4D9',
  '#A8744F',
  '#7C8A9E',
  '#C9A227',
]

export function alpha(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

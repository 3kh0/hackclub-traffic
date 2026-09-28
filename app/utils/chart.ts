import type { ChartOptions, CrosshairMode, DeepPartial, LineStyle } from 'lightweight-charts'

// enum values inlined so this file never pulls lightweight-charts into the main bundle
export const DASHED = 2 as LineStyle
const NORMAL = 0 as CrosshairMode

export interface ChartTheme {
  text: string
  grid: string
  border: string
  crosshair: string
}

// theme-dependent options, re-applied when the kumo color mode changes
export function themeOptions(t: ChartTheme): DeepPartial<ChartOptions> {
  return {
    layout: { textColor: t.text },
    grid: {
      vertLines: { visible: false },
      horzLines: { color: t.grid, style: DASHED },
    },
    leftPriceScale: { borderColor: t.border },
    timeScale: { borderColor: t.border },
    crosshair: { vertLine: { color: t.crosshair } },
  }
}

export function baseOptions(t: ChartTheme): DeepPartial<ChartOptions> {
  const theme = themeOptions(t)
  return {
    ...theme,
    layout: {
      ...theme.layout,
      background: { color: 'transparent' },
      fontFamily: "'Inter Variable', ui-sans-serif, system-ui, sans-serif",
      fontSize: 12,
      attributionLogo: false,
    },
    leftPriceScale: {
      ...theme.leftPriceScale,
      visible: true,
      borderVisible: false,
      minimumWidth: 50,
    },
    rightPriceScale: { visible: false },
    timeScale: {
      ...theme.timeScale,
      visible: true,
      timeVisible: true,
      secondsVisible: false,
      tickMarkFormatter: (time: number, tickMarkType: number) => {
        const d = new Date(time * 1000)
        if (tickMarkType <= 0) return d.toLocaleDateString(undefined, { year: 'numeric' })
        if (tickMarkType === 1) return d.toLocaleDateString(undefined, { month: 'short' })
        if (tickMarkType === 2) return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        if (d.getMinutes() % 5 !== 0) return ''
        return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false })
      },
    },
    crosshair: {
      mode: NORMAL,
      vertLine: { ...theme.crosshair!.vertLine, width: 1, style: DASHED, labelVisible: false },
      horzLine: { visible: false, labelVisible: false },
    },
    handleScale: false,
    handleScroll: false,
    autoSize: true,
  }
}

export function fmtTime(t: number | string, span?: number) {
  const d = typeof t === 'number' ? new Date(t * 1000) : new Date(t)
  if (!span || span >= 7) return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

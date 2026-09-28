import { computed, useState } from '#imports'
import { alpha } from '~/utils/palette'

export type ColorMode = 'light' | 'dark'
export const MODE_KEY = 'kumo-mode'

// kumo themes via data-mode on <html>; set before paint by the inline script in nuxt.config,
// then synced into this state by plugins/color-mode.client.ts
export function useColorMode() {
  const mode = useState<ColorMode>('color-mode', () => 'light')

  function toggle() {
    const next = mode.value === 'dark' ? 'light' : 'dark'
    mode.value = next
    document.documentElement.dataset.mode = next
    try {
      localStorage.setItem(MODE_KEY, next)
    } catch {}
  }

  return { mode, toggle }
}

// mirrors ChartPalette.text / semantic("Skeleton") from kumo
export function useChartTheme() {
  const { mode } = useColorMode()
  return computed(() => {
    const dark = mode.value === 'dark'
    const text = dark ? '#9CA3AF' : '#6B7280'
    return {
      text,
      grid: alpha(text, 0.15),
      border: alpha(text, 0.25),
      crosshair: alpha(text, 0.5),
      skeleton: dark ? '#5C5C5C' : '#DDDDDD',
      dark,
    }
  })
}

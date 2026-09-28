import { onBeforeUnmount, onMounted, watch, type Ref, type WatchSource } from 'vue'
import type { IChartApi } from 'lightweight-charts'
import { baseOptions, themeOptions } from '~/utils/chart'

export type LW = typeof import('lightweight-charts')

// loaded on demand so the chart library stays off the critical path
let lib: Promise<LW> | undefined
const load = () => (lib ??= import('lightweight-charts'))

// creates a themed chart in `el`, runs `init`, and rebuilds it when `deps` change
export function useChart(el: Ref<HTMLElement | undefined>, init: (c: IChartApi, lw: LW) => void, deps: WatchSource[]) {
  const theme = useChartTheme()
  let chart: IChartApi | null = null
  let gen = 0 // bumped on teardown so a build still waiting on the library bails out

  const build = async () => {
    const g = gen
    const lw = await load()
    if (g !== gen || !el.value) return
    chart = lw.createChart(el.value, baseOptions(theme.value))
    init(chart, lw)
    chart.timeScale().fitContent()
  }
  const destroy = () => {
    gen++
    chart?.remove()
    chart = null
  }

  if (import.meta.client) load()
  onMounted(build)
  onBeforeUnmount(destroy)
  watch(theme, (t) => chart?.applyOptions(themeOptions(t)))
  watch(deps, () => (destroy(), build()))

  return () => chart
}

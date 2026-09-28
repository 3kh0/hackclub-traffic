import { onBeforeUnmount, onMounted, watch, type Ref, type WatchSource } from 'vue'
import { createChart, type IChartApi } from 'lightweight-charts'
import { baseOptions, themeOptions } from '~/utils/chart'

// creates a themed chart in `el`, runs `init`, and rebuilds it when `deps` change
export function useChart(el: Ref<HTMLElement | undefined>, init: (c: IChartApi) => void, deps: WatchSource[]) {
  const theme = useChartTheme()
  let chart: IChartApi | null = null

  const build = () => {
    if (!el.value) return
    chart = createChart(el.value, baseOptions(theme.value))
    init(chart)
    chart.timeScale().fitContent()
  }
  const destroy = () => {
    chart?.remove()
    chart = null
  }

  onMounted(build)
  onBeforeUnmount(destroy)
  watch(theme, (t) => chart?.applyOptions(themeOptions(t)))
  watch(deps, () => (destroy(), build()))

  return () => chart
}

import { COLORS } from '~/utils/format'

export function useColorMap(selected: Ref<Set<string>>) {
  const colorMap = ref(new Map<string, string>())

  watch(selected, (cur) => {
    const map = new Map(colorMap.value)

    for (const name of map.keys()) {
      if (!cur.has(name)) {
        map.delete(name)
      }
    }

    const usedColors = new Set(map.values())

    for (const name of cur) {
      if (!map.has(name)) {
        const free = COLORS.find(c => !usedColors.has(c))
        if (free) {
          map.set(name, free)
          usedColors.add(free)
        }
      }
    }

    colorMap.value = map
  }, { immediate: true })

  return colorMap
}

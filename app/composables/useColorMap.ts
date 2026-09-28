import { ref, watch, type Ref } from '#imports'
import { COLORS } from '~/utils/palette'

// keeps each selected name's color stable while others are added or removed
export function useColorMap(selected: Ref<Set<string>>) {
  const colorMap = ref(new Map<string, string>())

  watch(
    selected,
    (cur) => {
      const map = new Map([...colorMap.value].filter(([name]) => cur.has(name)))
      const used = new Set(map.values())
      for (const name of cur) {
        const free = !map.has(name) && COLORS.find((c) => !used.has(c))
        if (free) {
          map.set(name, free)
          used.add(free)
        }
      }
      colorMap.value = map
    },
    { immediate: true },
  )

  return colorMap
}

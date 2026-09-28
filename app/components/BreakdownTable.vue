<template>
  <LayerCard :title="`${label} Breakdown`" flush>
    <template #actions>
      <span
        class="inline-flex items-center rounded-full bg-kumo-fill px-2 py-0.5 text-xs font-medium text-kumo-badge-neutral-subtle tabular-nums"
      >
        {{ selected.size }} / 15 on chart
      </span>
    </template>
    <div class="overflow-x-auto">
      <!-- kumo Table: header on base, zebra rows on elevated -->
      <table
        class="isolate w-full table-fixed text-left text-base text-kumo-default [&_td]:p-3 [&_th]:border-b [&_th]:border-kumo-fill [&_th]:bg-kumo-base [&_th]:p-3 [&_th]:font-semibold"
      >
        <thead>
          <tr>
            <th class="w-11"><span class="sr-only">Show on chart</span></th>
            <th class="w-[40%]">{{ label }}</th>
            <th
              v-for="col in COLUMNS"
              :key="col.key"
              class="w-[20%] text-right"
              :aria-sort="sort.key === col.key ? (sort.dir === 'desc' ? 'descending' : 'ascending') : undefined"
            >
              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-1 rounded font-semibold hover:text-kumo-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand"
                :class="sort.key === col.key ? 'text-kumo-default' : 'text-kumo-subtle'"
                @click="t(col.key)"
              >
                {{ col.label }}
                <component
                  :is="sort.dir === 'desc' ? PhArrowDown : PhArrowUp"
                  v-if="sort.key === col.key"
                  :size="14"
                  weight="bold"
                />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in rows"
            :key="item.name"
            class="bg-kumo-base transition-colors even:bg-kumo-elevated"
            :class="[
              !item.on && 'text-kumo-subtle',
              item.locked
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer hover:bg-kumo-tint even:hover:bg-kumo-tint',
            ]"
            @click="!item.locked && $emit('t', item.name)"
          >
            <td>
              <!-- kumo Checkbox, filled with the series color when checked -->
              <button
                type="button"
                role="checkbox"
                data-kumo-component="Checkbox"
                :aria-checked="item.on"
                :aria-label="`Show ${item.name} on chart`"
                :disabled="item.locked"
                class="relative flex size-4 items-center justify-center rounded-sm border-0 bg-kumo-base ring ring-kumo-hairline focus:outline-none focus-visible:ring-2 focus-visible:ring-kumo-brand disabled:cursor-not-allowed"
                :style="item.on && { backgroundColor: item.color, '--tw-ring-color': item.color }"
                @click.stop="$emit('t', item.name)"
              >
                <PhCheck v-if="item.on" :size="12" weight="bold" class="text-white" />
              </button>
            </td>
            <td class="truncate font-medium" :class="item.on && 'text-kumo-strong'" :title="item.name">
              {{ item.name }}
            </td>
            <td class="text-right tabular-nums">{{ fmtNum(item.totalRequests) }}</td>
            <td class="text-right tabular-nums">{{ fmt(item.totalBytes) }}</td>
            <td class="text-right tabular-nums">{{ fmtNum(item.totalVisits) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </LayerCard>
</template>

<script setup lang="ts">
import { PhArrowDown, PhArrowUp, PhCheck } from '@phosphor-icons/vue'
import { fmt, fmtNum } from '~/utils/format'
import { METRICS, TOTALS, type Metric } from '~/composables/useMetric'

const COLUMNS = (Object.keys(METRICS) as Metric[]).map((key) => ({ key, label: METRICS[key] }))

interface Item {
  name: string
  totalRequests: number
  totalBytes: number
  totalVisits: number
}

const props = defineProps<{
  label: string
  items: Item[]
  selected: Set<string>
  colorMap: Map<string, string>
  defaultSort?: Metric
}>()

defineEmits<{ t: [name: string] }>()

// follows the Metric select until the user clicks a column
const userOverride = ref(false)
const sort = ref<{ key: Metric; dir: 'desc' | 'asc' }>({ key: props.defaultSort ?? 'requests', dir: 'desc' })

watch(
  () => props.defaultSort,
  (key) => key && !userOverride.value && (sort.value = { key, dir: 'desc' }),
)

function t(key: Metric) {
  userOverride.value = true
  sort.value = { key, dir: sort.value.key === key && sort.value.dir === 'desc' ? 'asc' : 'desc' }
}

const rows = computed(() => {
  const { key, dir } = sort.value
  const f = TOTALS[key]
  return props.items
    .toSorted((a, b) => (dir === 'desc' ? b[f] - a[f] : a[f] - b[f]))
    .map((i) => {
      const on = props.selected.has(i.name)
      return { ...i, on, locked: !on && props.selected.size >= 15, color: props.colorMap.get(i.name) }
    })
})
</script>

<template>
  <div class="bg-background">
    <h2 class="text-lg text-main font-semibold mb-4">{{ label }} Breakdown</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm table-fixed">
        <thead>
          <tr class="text-subtext text-left border-b border-white/10">
            <th class="pb-2 pr-4 w-8"></th>
            <th class="pb-2 pr-4 text-main font-semibold" :class="'w-[40%]'">{{ label }}</th>
            <th class="pb-2 pr-4 text-right cursor-pointer select-none hover:text-main transition-colors w-[20%]" @click="t('requests')">
              Requests <span v-if="sort.key === 'requests'" class="text-graph">{{ sort.dir === 'desc' ? '↓' : '↑' }}</span>
            </th>
            <th class="pb-2 pr-4 text-right cursor-pointer select-none hover:text-main transition-colors w-[20%]" @click="t('bytes')">
              Data Transfer <span v-if="sort.key === 'bytes'" class="text-graph">{{ sort.dir === 'desc' ? '↓' : '↑' }}</span>
            </th>
            <th class="pb-2 text-right cursor-pointer select-none hover:text-main transition-colors w-[20%]" @click="t('visits')">
              Visits <span v-if="sort.key === 'visits'" class="text-graph">{{ sort.dir === 'desc' ? '↓' : '↑' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in sorted"
            :key="item.name"
            class="border-b p-2 border-white/5 transition-colors"
            :class="[
              selected.has(item.name) ? 'hover:bg-white/5 cursor-pointer' : 'opacity-40 hover:opacity-70',
              !selected.has(item.name) && selected.size >= 15 ? 'cursor-not-allowed opacity-20 hover:opacity-20' : !selected.has(item.name) ? 'cursor-pointer' : ''
            ]"
            @click="$emit('t', item.name)"
          >
            <td class="py-2 pr-4">
              <div
                class="w-3 h-3 rounded-full transition-all"
                :style="{
                  backgroundColor: selected.has(item.name) ? colorMap.get(item.name) : 'transparent',
                  border: selected.has(item.name) ? 'none' : '2px solid rgba(255,255,255,0.25)'
                }"
              />
            </td>
            <td class="py-2 pr-4 text-main font-mono font-bold truncate" :title="item.name">{{ item.name }}</td>
            <td class="py-2 pr-4 text-right text-main">{{ fmtNum(item.totalRequests) }}</td>
            <td class="py-2 pr-4 text-right text-main">{{ fmt(item.totalBytes) }}</td>
            <td class="py-2 text-right text-main">{{ fmtNum(item.totalVisits) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { fmt, fmtNum } from '~/utils/format'

type SortKey = 'requests' | 'bytes' | 'visits'

interface Item {
  name: string
  _index: number
  totalRequests: number
  totalBytes: number
  totalVisits: number
}

const props = defineProps<{
  label: string
  items: Item[]
  selected: Set<string>
  colorMap: Map<string, string>
  defaultSort?: SortKey
}>()

defineEmits<{ t: [name: string] }>()

const userOverride = ref(false)
const sort = ref<{ key: SortKey; dir: 'desc' | 'asc' }>({ key: props.defaultSort ?? 'requests', dir: 'desc' })

watch(() => props.defaultSort, (key) => {
  if (!userOverride.value && key) {
    sort.value = { key, dir: 'desc' }
  }
})

function t(key: SortKey) {
  userOverride.value = true
  if (sort.value.key === key) {
    sort.value.dir = sort.value.dir === 'desc' ? 'asc' : 'desc'
  } else {
    sort.value = { key, dir: 'desc' }
  }
}

const sorted = computed(() => {
  const keyMap = { requests: 'totalRequests', bytes: 'totalBytes', visits: 'totalVisits' } as const
  const field = keyMap[sort.value.key]
  const mult = sort.value.dir === 'desc' ? -1 : 1
  return [...props.items].sort((a: any, b: any) => mult * (a[field] - b[field]))
})
</script>

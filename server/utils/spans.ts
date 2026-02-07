export interface Span {
  id: number
  label: string
  ms: number
  dataset: string
  filterType: string
  orderBy: string
  limit: number
  datetimeField: string
  adaptiveDimension: string
}

export const SPANS: Record<number, Span> = {
  1: {
    id: 1,
    label: 'Last 30 minutes',
    ms: 30 * 60 * 1000,
    dataset: 'httpRequests1mGroups',
    filterType: 'ZoneHttpRequests1mGroupsFilter_InputObject',
    orderBy: 'datetimeMinute_ASC',
    limit: 30,
    datetimeField: 'datetimeMinute',
    adaptiveDimension: 'datetimeMinute',
  },
  2: {
    id: 2,
    label: 'Last 6 hours',
    ms: 6 * 60 * 60 * 1000,
    dataset: 'httpRequests1mGroups',
    filterType: 'ZoneHttpRequests1mGroupsFilter_InputObject',
    orderBy: 'datetimeFiveMinutes_ASC',
    limit: 72,
    datetimeField: 'datetimeFiveMinutes',
    adaptiveDimension: 'datetimeFiveMinutes',
  },
  3: {
    id: 3,
    label: 'Last 12 hours',
    ms: 12 * 60 * 60 * 1000,
    dataset: 'httpRequests1mGroups',
    filterType: 'ZoneHttpRequests1mGroupsFilter_InputObject',
    orderBy: 'datetimeFifteenMinutes_ASC',
    limit: 48,
    datetimeField: 'datetimeFifteenMinutes',
    adaptiveDimension: 'datetimeFifteenMinutes',
  },
  4: {
    id: 4,
    label: 'Last 24 hours',
    ms: 24 * 60 * 60 * 1000,
    dataset: 'httpRequests1mGroups',
    filterType: 'ZoneHttpRequests1mGroupsFilter_InputObject',
    orderBy: 'datetimeFifteenMinutes_ASC',
    limit: 96,
    datetimeField: 'datetimeFifteenMinutes',
    adaptiveDimension: 'datetimeFifteenMinutes',
  },
  5: {
    id: 5,
    label: 'Last 3 days',
    ms: 3 * 24 * 60 * 60 * 1000,
    dataset: 'httpRequests1hGroups',
    filterType: 'ZoneHttpRequests1hGroupsFilter_InputObject',
    orderBy: 'datetime_ASC',
    limit: 72,
    datetimeField: 'datetime',
    adaptiveDimension: 'datetimeHour',
  },
  6: {
    id: 6,
    label: 'Last 7 days',
    ms: 7 * 24 * 60 * 60 * 1000,
    dataset: 'httpRequests1hGroups',
    filterType: 'ZoneHttpRequests1hGroupsFilter_InputObject',
    orderBy: 'datetime_ASC',
    limit: 168,
    datetimeField: 'datetime',
    adaptiveDimension: 'datetimeHour',
  },
  7: {
    id: 7,
    label: 'Last 30 days',
    ms: 30 * 24 * 60 * 60 * 1000,
    dataset: 'httpRequests1dGroups',
    filterType: 'ZoneHttpRequests1dGroupsFilter_InputObject',
    orderBy: 'date_ASC',
    limit: 30,
    datetimeField: 'date',
    adaptiveDimension: 'date',
  },
}

export function getSpan(id: number): Span {
  const span = SPANS[id]
  if (!span) throw createError({ statusCode: 403 })
  return span
}

export function useSpan(span: Span) {
  const now = new Date()
  const since = new Date(now.getTime() - span.ms)
  return { now, since }
}

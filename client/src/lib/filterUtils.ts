export type FilterPreset = 'all' | 'today' | 'week' | 'month' | 'year';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface FilterState {
  preset: FilterPreset;
  range: DateRange;
}

export const filterPresets: { value: FilterPreset; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

export function computeDateRange(preset: FilterPreset): DateRange {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const startOfWeek = (d: Date) => {
    const date = startOfDay(d);
    const day = date.getDay();
    return new Date(date.getTime() - day * 24 * 60 * 60 * 1000);
  };
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);

  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: now };
    case 'week':
      return { from: startOfWeek(now), to: now };
    case 'month':
      return { from: startOfMonth(now), to: now };
    case 'year':
      return { from: startOfYear(now), to: now };
    default:
      return { from: null, to: null };
  }
}

export function filterByDate<T>(
  items: T[],
  filter: FilterState,
  getDate: (item: T) => string = (item: any) => item.date
): T[] {
  if (filter.preset === 'all') return items;

  const range = filter.range.from && filter.range.to
    ? filter.range
    : computeDateRange(filter.preset);

  if (!range.from || !range.to) return items;

  return items.filter(item => {
    const itemDate = new Date(getDate(item));
    return itemDate >= range.from! && itemDate <= range.to!;
  });
}

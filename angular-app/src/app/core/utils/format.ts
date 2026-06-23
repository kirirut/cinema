export function formatRating(value: number | null | undefined): string {
  if (value == null || value === 0) return '—';
  return value.toFixed(1);
}

export function formatDuration(minutes: number | null | undefined): string | null {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} мин.`;
  return m > 0 ? `${h} ч ${m} мин.` : `${h} ч.`;
}

export function posterFallback(title: string): string {
  return title.charAt(0).toUpperCase();
}

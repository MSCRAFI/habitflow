/**
 * Date helpers with predictable, locale-agnostic defaults. All functions are pure.
 */

export const formatISODate = (d) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date?.getTime?.())) return '';
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

export const formatShort = (d) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date?.getTime?.())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const daysBetween = (a, b) => {
  const d1 = new Date(formatISODate(a));
  const d2 = new Date(formatISODate(b));
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
};

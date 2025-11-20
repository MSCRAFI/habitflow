/**
 * Display formatters. Keep pure and presentation-focused.
 */

export const formatPercent = (n, digits = 0) => {
  const num = Number(n) || 0;
  return `${num.toFixed(digits)}%`;
};

export const formatNumber = (n) => {
  const num = Number(n) || 0;
  return new Intl.NumberFormat().format(num);
};

export const clamp = (v, min = 0, max = 100) => Math.min(max, Math.max(min, v));

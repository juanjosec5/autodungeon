/**
 * Format a number with k/M suffix for display.
 * 2000 → "2k", 17500 → "17.5k", 1000000 → "1M"
 */
export function fmtNum(n: number): string {
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    return (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + 'M'
  }
  if (n >= 1_000) {
    const v = n / 1_000
    return (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + 'k'
  }
  return String(n)
}

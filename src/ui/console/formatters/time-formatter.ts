/**
 * Time formatting utilities for race display
 */

/**
 * Format lap time in seconds to readable string
 * Examples:
 *   15.412 → "15.412s"
 *   91.234 → "1:31.234"
 *   3661.5 → "1:01:01.500"
 */
export function formatLapTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(3)}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toFixed(3).padStart(6, '0')}`;
  }

  return `${minutes}:${secs.toFixed(3).padStart(6, '0')}`;
}

/**
 * Format time gap to leader or next car
 * Examples:
 *   0 → "Leader"
 *   1.234 → "+1.234s"
 *   -0.5 → "-0.500s" (shouldn't happen but handle it)
 */
export function formatGap(seconds: number): string {
  if (seconds === 0) {
    return 'Leader';
  }

  const sign = seconds > 0 ? '+' : '';
  return `${sign}${seconds.toFixed(3)}s`;
}

/**
 * Format race duration
 * Examples:
 *   125 → "2m 5s"
 *   3665 → "1h 1m 5s"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
}

/**
 * Format percentage with decimals
 * Examples:
 *   75.5 → "75.5%"
 *   100 → "100%"
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format position with ordinal suffix
 * Examples:
 *   1 → "1st"
 *   2 → "2nd"
 *   3 → "3rd"
 *   4 → "4th"
 *   21 → "21st"
 */
export function formatPosition(position: number): string {
  const lastDigit = position % 10;
  const lastTwoDigits = position % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${position}th`;
  }

  switch (lastDigit) {
    case 1:
      return `${position}st`;
    case 2:
      return `${position}nd`;
    case 3:
      return `${position}rd`;
    default:
      return `${position}th`;
  }
}

/**
 * Format positions gained/lost
 * Examples:
 *   5 → "+5"
 *   -3 → "-3"
 *   0 → "—"
 */
export function formatPositionChange(change: number): string {
  if (change === 0) {
    return '—';
  }

  return change > 0 ? `+${change}` : `${change}`;
}

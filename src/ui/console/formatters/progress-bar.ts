/**
 * Progress bar rendering utilities
 */

/**
 * Render a progress bar using block characters
 * Examples:
 *   renderProgressBar(75, 100, 16) → "████████████░░░░ 75%"
 *   renderProgressBar(100, 100, 20) → "████████████████████ 100%"
 *   renderProgressBar(0, 100, 10) → "░░░░░░░░░░ 0%"
 */
export function renderProgressBar(
  value: number,
  max: number,
  width: number = 16,
  showPercentage: boolean = true
): string {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));
  const filled = Math.round((percentage / 100) * width);
  const empty = width - filled;

  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);

  const percentageText = showPercentage ? ` ${percentage.toFixed(0)}%` : '';

  return `${filledBar}${emptyBar}${percentageText}`;
}

/**
 * Render a progress bar with color-based warning levels
 * Green for high values, yellow for medium, red for low
 * (Uses basic characters - can be enhanced with ANSI colors later)
 */
export function renderWarningBar(
  value: number,
  max: number,
  width: number = 16,
  thresholds: { low: number; medium: number } = { low: 25, medium: 50 }
): string {
  const percentage = (value / max) * 100;
  const bar = renderProgressBar(value, max, width, true);

  // Could add ANSI color codes here in the future
  // For now, return the basic bar
  return bar;
}

/**
 * Render a trend indicator
 * Examples:
 *   renderTrend(5) → "↑"
 *   renderTrend(-3) → "↓"
 *   renderTrend(0) → "→"
 */
export function renderTrend(change: number): string {
  if (change > 0) return '↑';
  if (change < 0) return '↓';
  return '→';
}

/**
 * Render a simple horizontal divider
 */
export function renderDivider(width: number = 60, char: string = '═'): string {
  return char.repeat(width);
}

/**
 * Render a centered title with dividers
 * Example:
 *   renderTitle("BRISTOL MOTOR SPEEDWAY", 60)
 *   → "════════════════ BRISTOL MOTOR SPEEDWAY ════════════════"
 */
export function renderTitle(title: string, width: number = 60): string {
  const padding = width - title.length - 2; // -2 for spaces around title
  const leftPad = Math.floor(padding / 2);
  const rightPad = Math.ceil(padding / 2);

  return `${'═'.repeat(leftPad)} ${title} ${'═'.repeat(rightPad)}`;
}

/**
 * Render a track-style lap progress bar (real-time lap completion)
 * Shows a car position marker moving through the lap
 * Examples:
 *   renderLapProgressBar(0.25, 32) → "[=======>........................]"
 *   renderLapProgressBar(0.75, 32) → "[=======================>........]"
 *   renderLapProgressBar(1.0, 32)  → "[================================]"
 */
export function renderLapProgressBar(
  progress: number,
  width: number = 32
): string {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const position = Math.floor(clampedProgress * width);

  if (position === 0) {
    // At start of lap
    return `[>${'.'.repeat(width - 1)}]`;
  } else if (position >= width) {
    // Completed lap
    return `[${'='.repeat(width)}]`;
  } else {
    // Mid-lap: show car position with arrow
    // The '>' represents the car, so it takes one position
    const completed = '='.repeat(position - 1);
    const remaining = '.'.repeat(width - position);
    return `[${completed}>${remaining}]`;
  }
}

/**
 * Render lap progress with percentage text
 * Example:
 *   renderLapProgressWithPercentage(0.653, 32)
 *   → "[===================>............] 65.3%"
 */
export function renderLapProgressWithPercentage(
  progress: number,
  width: number = 32
): string {
  const bar = renderLapProgressBar(progress, width);
  const percentage = (Math.max(0, Math.min(1, progress)) * 100).toFixed(1);
  return `${bar} ${percentage}%`;
}

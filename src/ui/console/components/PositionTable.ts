/**
 * Position Table Component
 * Formats race standings with positions, drivers, lap times, and gaps
 */

import type { Position } from '../../../types';
import { formatTable } from '../formatters/table-formatter';
import { formatLapTime, formatGap } from '../formatters/time-formatter';

export interface PositionTableOptions {
  /** Maximum number of positions to show (default: all) */
  maxPositions?: number;
  /** Highlight this driver ID with a marker */
  highlightDriverId?: string;
  /** Show lap times column */
  showLapTimes?: boolean;
  /** Show gap to leader column */
  showGapToLeader?: boolean;
  /** Show gap to next car column */
  showGapToNext?: boolean;
}

/**
 * Format race positions as an ASCII table
 *
 * Example output:
 * ```
 * Pos | Car# | Driver              | Last Lap  | Gap
 * ----+------+---------------------+-----------+--------
 *  1  | #3   | Dale Earnhardt      |  15.412s  | Leader
 *  2  | #24  | Jeff Gordon         |  15.438s  | +0.026s
 *  3  | #48  | Jimmie Johnson      |  15.501s  | +0.089s
 * ```
 */
export function formatPositionTable(
  positions: Position[],
  options: PositionTableOptions = {}
): string {
  const {
    maxPositions = positions.length,
    highlightDriverId,
    showLapTimes = true,
    showGapToLeader = true,
    showGapToNext = false,
  } = options;

  // Limit positions if requested
  const displayPositions = positions.slice(0, maxPositions);

  // Build column configuration
  const columns = [
    { header: 'Pos', align: 'right' as const, width: 3 },
    { header: 'Car#', align: 'left' as const, width: 5 },
    { header: 'Driver', align: 'left' as const },
  ];

  if (showLapTimes) {
    columns.push({ header: 'Last Lap', align: 'right' as const, width: 9 });
  }

  if (showGapToLeader) {
    columns.push({ header: 'Gap', align: 'right' as const, width: 8 });
  }

  if (showGapToNext) {
    columns.push({ header: 'Ahead', align: 'right' as const, width: 8 });
  }

  // Build row data
  const rows = displayPositions.map(pos => {
    const row: string[] = [];

    // Position number (with marker if highlighted)
    const isHighlighted = pos.driverId === highlightDriverId;
    const posStr = isHighlighted ? `${pos.position}*` : `${pos.position}`;
    row.push(posStr);

    // Car number (extract number from driverId or use default)
    const carNumber = pos.driverId.match(/#(\d+)/) ? pos.driverId : `#${pos.driverId}`;
    row.push(carNumber);

    // Driver name (mark if highlighted)
    const driverName = isHighlighted ? `YOU (${pos.driverName})` : pos.driverName;
    row.push(driverName);

    // Last lap time
    if (showLapTimes) {
      row.push(formatLapTime(pos.lapTime));
    }

    // Gap to leader
    if (showGapToLeader) {
      row.push(formatGap(pos.gapToLeader));
    }

    // Gap to next
    if (showGapToNext) {
      row.push(formatGap(pos.gapToNext));
    }

    return row;
  });

  return formatTable({ columns }, rows);
}

/**
 * Format a compact version showing only top N and player position
 *
 * Example output:
 * ```
 * Pos | Driver              | Gap
 * ----+---------------------+--------
 *  1  | Dale Earnhardt      | Leader
 *  2  | Jeff Gordon         | +0.026s
 *  3  | Jimmie Johnson      | +0.089s
 * ...
 *  5  | YOU (Kyle Busch)    | +1.234s  *
 * ```
 */
export function formatCompactPositionTable(
  positions: Position[],
  topN: number,
  playerDriverId: string
): string {
  const playerPos = positions.find(p => p.driverId === playerDriverId);

  if (!playerPos) {
    // Player not found, just show top N
    return formatPositionTable(positions, {
      maxPositions: topN,
      showLapTimes: false,
      showGapToNext: false,
    });
  }

  // If player is in top N, just show top N
  if (playerPos.position <= topN) {
    return formatPositionTable(positions, {
      maxPositions: topN,
      highlightDriverId: playerDriverId,
      showLapTimes: false,
      showGapToNext: false,
    });
  }

  // Show top N-1, then ellipsis, then player
  const topPositions = positions.slice(0, topN - 1);
  const table = formatPositionTable(topPositions, {
    showLapTimes: false,
    showGapToNext: false,
  });

  // Add ellipsis
  const ellipsisLine = ' ... | ...                 | ...';

  // Add player line
  const playerLine = formatPositionTable([playerPos], {
    maxPositions: 1,
    highlightDriverId: playerDriverId,
    showLapTimes: false,
    showGapToNext: false,
    showGapToLeader: true,
  });

  // Extract just the data row (skip header and separator)
  const playerDataRow = playerLine.split('\n')[2];

  return `${table}\n${ellipsisLine}\n${playerDataRow}`;
}

/**
 * Format just the top 3 as a podium
 *
 * Example output:
 * ```
 *       1st: #3 Dale Earnhardt      15.412s
 *       2nd: #24 Jeff Gordon         15.438s
 *       3rd: #48 Jimmie Johnson      15.501s
 * ```
 */
export function formatPodium(positions: Position[]): string {
  const podium = positions.slice(0, 3);

  const lines = podium.map(pos => {
    const suffix = pos.position === 1 ? 'st' : pos.position === 2 ? 'nd' : 'rd';
    const carNum = pos.driverId.match(/#(\d+)/) ? pos.driverId : `#${pos.driverId}`;
    const time = formatLapTime(pos.lapTime);

    return `      ${pos.position}${suffix}: ${carNum} ${pos.driverName.padEnd(20)} ${time}`;
  });

  return lines.join('\n');
}

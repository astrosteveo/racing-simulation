/**
 * Live Race Display Component
 * Renders the current race state with standings, car status, and mental state
 */

import type { RaceState } from '../../../types';
import { formatPositionTable, formatCompactPositionTable } from './PositionTable';
import { renderTitle, renderDivider, renderProgressBar, renderTrend } from '../formatters/progress-bar';
import { formatLapTime, formatPositionChange } from '../formatters/time-formatter';

export interface LiveRaceDisplayOptions {
  /** Number of positions to show in standings */
  standingsDepth?: number;
  /** Width of the display (characters) */
  width?: number;
  /** Show detailed car status */
  showCarStatus?: boolean;
  /** Show mental state */
  showMentalState?: boolean;
}

/**
 * Render the complete live race display
 *
 * Shows:
 * - Track name and lap counter
 * - Leader information
 * - Player status (position, gaps)
 * - Standings table
 * - Car status (tires, fuel)
 * - Mental state
 */
export function renderLiveRaceDisplay(
  state: RaceState,
  options: LiveRaceDisplayOptions = {}
): string {
  const {
    standingsDepth = 10,
    width = 60,
    showCarStatus = true,
    showMentalState = true,
  } = options;

  const sections: string[] = [];

  // ========== Header ==========
  sections.push(renderDivider(width));
  sections.push(renderTitle(state.track.name.toUpperCase(), width));
  sections.push(renderTitle(`Lap ${state.currentLap} / ${state.totalLaps}`, width));
  sections.push(renderDivider(width));
  sections.push('');

  // ========== Leader Info ==========
  const leader = state.positions[0];
  if (leader) {
    sections.push(`LEADER: ${leader.driverName.padEnd(30)} Last Lap: ${formatLapTime(leader.lapTime)}`);
    sections.push('');
  }

  // ========== Player Status ==========
  const startPos = 20; // TODO: Get from race config or state
  const posChange = startPos - state.playerPosition;
  const changeStr = formatPositionChange(posChange);

  sections.push('YOUR STATUS:');
  sections.push(`Position: P${state.playerPosition} (${changeStr} from start)`);

  const playerPosData = state.positions.find(p => p.driverId === state.playerDriver.id);
  if (playerPosData) {
    const gapToLeaderStr = state.playerPosition === 1 ? 'LEADING' : formatLapTime(playerPosData.gapToLeader);
    const gapToNextStr = state.playerPosition === 1 ? '—' : formatLapTime(playerPosData.gapToNext);

    sections.push(`Gap to Leader: ${gapToLeaderStr}  |  Gap Ahead: ${gapToNextStr}`);
  }
  sections.push('');

  // ========== Standings Table ==========
  sections.push('STANDINGS:');
  if (state.playerPosition <= standingsDepth) {
    // Player is in top N, show standard table
    sections.push(formatPositionTable(state.positions, {
      maxPositions: standingsDepth,
      highlightDriverId: state.playerDriver.id,
      showLapTimes: true,
      showGapToLeader: true,
      showGapToNext: false,
    }));
  } else {
    // Player is outside top N, show compact view
    sections.push(formatCompactPositionTable(
      state.positions,
      standingsDepth - 1,
      state.playerDriver.id
    ));
  }
  sections.push('');

  // ========== Car Status ==========
  if (showCarStatus) {
    sections.push('CAR STATUS:');

    const tireBar = renderProgressBar(state.playerCar.tireWear, 100, 16);
    const fuelBar = renderProgressBar(state.playerCar.fuelLevel, 100, 16);

    sections.push(`Tires: ${tireBar}  (${state.playerCar.lapsSincePit} laps since pit)`);
    sections.push(`Fuel:  ${fuelBar}`);
    sections.push('');
  }

  // ========== Mental State ==========
  if (showMentalState) {
    sections.push('MENTAL STATE:');

    const ms = state.playerDriver.mentalState;

    // TODO: Track previous values to show trends
    const confBar = renderProgressBar(ms.confidence, 100, 16);
    const focusBar = renderProgressBar(ms.focus, 100, 16);
    const frustBar = renderProgressBar(ms.frustration, 100, 16);
    const distractBar = renderProgressBar(ms.distraction, 100, 16);

    sections.push(`Confidence:  ${confBar} ${renderTrend(0)}`);
    sections.push(`Focus:       ${focusBar} ${renderTrend(0)}`);
    sections.push(`Frustration: ${frustBar} ${renderTrend(0)}`);
    sections.push(`Distraction: ${distractBar} ${renderTrend(0)}`);
    sections.push('');
  }

  // ========== Footer ==========
  sections.push(renderDivider(width));

  return sections.join('\n');
}

/**
 * Render a minimal race status (for quick updates)
 *
 * Shows just:
 * - Lap number
 * - Position
 * - Gap to leader
 * - Last lap time
 */
export function renderMinimalRaceStatus(state: RaceState): string {
  const playerPos = state.positions.find(p => p.driverId === state.playerDriver.id);
  const gapStr = playerPos ? formatLapTime(playerPos.gapToLeader) : '—';
  const lastLapStr = playerPos ? formatLapTime(playerPos.lapTime) : '—';

  return [
    `Lap ${state.currentLap}/${state.totalLaps}`,
    `P${state.playerPosition}`,
    `Gap: ${gapStr}`,
    `Last: ${lastLapStr}`,
  ].join(' | ');
}

/**
 * Render just the lap counter as a progress bar
 *
 * Example:
 * ```
 * Lap 42 / 500  ████░░░░░░░░░░░░  8%
 * ```
 */
export function renderLapProgress(state: RaceState): string {
  const progressBar = renderProgressBar(state.currentLap, state.totalLaps, 20);
  return `Lap ${state.currentLap} / ${state.totalLaps}  ${progressBar}`;
}

/**
 * Race Results Display Component
 * Shows final race results with statistics and XP breakdown
 */

import type { RaceResults, Track } from '../../../types';
import { renderTitle, renderDivider, renderProgressBar } from '../formatters/progress-bar';
import { formatPosition, formatPositionChange, formatLapTime } from '../formatters/time-formatter';
import { formatKeyValueTable } from '../formatters/table-formatter';

export interface RaceResultsDisplayOptions {
  /** Width of the display (characters) */
  width?: number;
  /** Show XP breakdown */
  showXP?: boolean;
  /** Show decision stats */
  showDecisions?: boolean;
}

/**
 * Render complete race results screen
 *
 * Shows:
 * - Track name and distance
 * - Finishing position vs start
 * - Race statistics
 * - XP gained breakdown
 */
export function renderRaceResults(
  results: RaceResults,
  track: Track,
  options: RaceResultsDisplayOptions = {}
): string {
  const {
    width = 60,
    showXP = true,
    showDecisions = true,
  } = options;

  const sections: string[] = [];

  // ========== Header ==========
  sections.push(renderDivider(width));
  sections.push(renderTitle('RACE RESULTS', width));
  sections.push(renderTitle(`${track.name} - ${results.lapsCompleted} Laps`, width));
  sections.push(renderDivider(width));
  sections.push('');

  // ========== Finishing Position ==========
  const finishPosStr = formatPosition(results.finishPosition);
  const changeStr = formatPositionChange(results.positionsGained);
  sections.push(`FINISHING POSITION: ${finishPosStr}  (${changeStr} from start)`);
  sections.push('');

  // ========== Race Stats ==========
  sections.push('RACE STATS:');

  const stats = {
    'Started': `P${results.startPosition}`,
    'Finished': `P${results.finishPosition}`,
    'Laps Led': `${results.lapsLed}`,
    'Fastest Lap': formatLapTime(results.fastestLap),
    'Average Lap': formatLapTime(results.averageLap),
    'Clean Laps': `${results.cleanLaps} / ${results.lapsCompleted}`,
  };

  sections.push(formatKeyValueTable(stats, 15));
  sections.push('');

  // ========== Decision Stats (if available) ==========
  if (showDecisions && results.decisionsTotal > 0) {
    sections.push('DECISIONS:');

    const decisionPercentage = (results.decisionsCorrect / results.decisionsTotal) * 100;
    const decisionStats = {
      'Total Decisions': `${results.decisionsTotal}`,
      'Good Decisions': `${results.decisionsCorrect}`,
      'Success Rate': `${decisionPercentage.toFixed(0)}%`,
    };

    sections.push(formatKeyValueTable(decisionStats, 15));
    sections.push('');
  }

  // ========== XP Gained ==========
  if (showXP && results.xpGained) {
    sections.push('XP GAINED:');

    // Calculate total XP
    const totalXP = Object.values(results.xpGained).reduce((sum, val) => sum + val, 0);

    // Show each skill that gained XP
    const xpEntries = Object.entries(results.xpGained)
      .filter(([_, xp]) => xp > 0)
      .sort(([_, a], [__, b]) => b - a); // Sort by XP descending

    xpEntries.forEach(([skill, xp]) => {
      const skillName = formatSkillName(skill);
      const bar = renderProgressBar(xp, 200, 12, false); // Max 200 XP per skill as reference
      const xpStr = `+${xp}`.padStart(5);
      sections.push(`${skillName.padEnd(18)} ${xpStr} ${bar}`);
    });

    sections.push('');
    sections.push(`TOTAL XP: +${totalXP}`);
    sections.push('');
  }

  // ========== Issues (if any) ==========
  if (results.issues && results.issues.length > 0) {
    sections.push('ISSUES:');
    results.issues.forEach(issue => {
      sections.push(`  ⚠ ${issue}`);
    });
    sections.push('');
  }

  // ========== Footer ==========
  sections.push(renderDivider(width));

  return sections.join('\n');
}

/**
 * Format skill names for display
 */
function formatSkillName(skill: string): string {
  // Convert camelCase to Title Case with spaces
  const words = skill.replace(/([A-Z])/g, ' $1').trim();
  return words
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Render a compact single-line race result
 *
 * Example: "Finished P5 (+2) | 12 laps led | +326 XP"
 */
export function renderCompactResult(results: RaceResults): string {
  const finishStr = `P${results.finishPosition}`;
  const changeStr = formatPositionChange(results.positionsGained);
  const totalXP = Object.values(results.xpGained).reduce((sum, val) => sum + val, 0);

  const parts = [
    `Finished ${finishStr} (${changeStr})`,
    `${results.lapsLed} laps led`,
    `+${totalXP} XP`,
  ];

  return parts.join(' | ');
}

/**
 * Render XP breakdown as a compact list
 */
export function renderXPBreakdown(results: RaceResults): string {
  const lines: string[] = ['XP GAINED:'];

  const xpEntries = Object.entries(results.xpGained)
    .filter(([_, xp]) => xp > 0)
    .sort(([_, a], [__, b]) => b - a);

  xpEntries.forEach(([skill, xp]) => {
    const skillName = formatSkillName(skill);
    lines.push(`  ${skillName}: +${xp}`);
  });

  const totalXP = Object.values(results.xpGained).reduce((sum, val) => sum + val, 0);
  lines.push(`  TOTAL: +${totalXP}`);

  return lines.join('\n');
}

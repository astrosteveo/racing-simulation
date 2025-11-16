/**
 * Driver Status Panel Component
 * Shows detailed driver information including skills, mental state, and career stats
 */

import type { Driver, DriverSkills, MentalState, CareerStats } from '../../../types';
import { renderTitle, renderDivider, renderProgressBar } from '../formatters/progress-bar';
import { formatKeyValueTable } from '../formatters/table-formatter';

export interface DriverStatusPanelOptions {
  /** Width of the display (characters) */
  width?: number;
  /** Show skills section */
  showSkills?: boolean;
  /** Show mental state section */
  showMentalState?: boolean;
  /** Show career stats section */
  showCareerStats?: boolean;
}

/**
 * Render complete driver status panel
 *
 * Shows:
 * - Driver name and number
 * - All 10 skills with progress bars
 * - Mental state
 * - Career statistics
 */
export function renderDriverStatusPanel(
  driver: Driver,
  options: DriverStatusPanelOptions = {}
): string {
  const {
    width = 60,
    showSkills = true,
    showMentalState = true,
    showCareerStats = true,
  } = options;

  const sections: string[] = [];

  // ========== Header ==========
  sections.push(renderDivider(width));
  sections.push(renderTitle(`DRIVER: #${driver.number} ${driver.name.toUpperCase()}`, width));
  sections.push(renderDivider(width));
  sections.push('');

  // ========== Skills ==========
  if (showSkills) {
    sections.push('SKILLS:');
    sections.push('');

    const skills = driver.skills;

    // Group skills into categories
    sections.push('Core Skills:');
    sections.push(renderSkillBar('Racecraft', skills.racecraft));
    sections.push(renderSkillBar('Consistency', skills.consistency));
    sections.push(renderSkillBar('Aggression', skills.aggression));
    sections.push(renderSkillBar('Focus', skills.focus));
    sections.push('');

    sections.push('Physical/Mental:');
    sections.push(renderSkillBar('Stamina', skills.stamina));
    sections.push(renderSkillBar('Composure', skills.composure));
    sections.push('');

    sections.push('Specialized Skills:');
    sections.push(renderSkillBar('Draft Sense', skills.draftSense));
    sections.push(renderSkillBar('Tire Management', skills.tireManagement));
    sections.push(renderSkillBar('Fuel Management', skills.fuelManagement));
    sections.push(renderSkillBar('Pit Strategy', skills.pitStrategy));
    sections.push('');
  }

  // ========== Mental State ==========
  if (showMentalState) {
    sections.push('MENTAL STATE:');
    sections.push('');

    const ms = driver.mentalState;

    sections.push(renderMentalStateBar('Confidence', ms.confidence, true));
    sections.push(renderMentalStateBar('Focus', ms.focus, true));
    sections.push(renderMentalStateBar('Frustration', ms.frustration, false));
    sections.push(renderMentalStateBar('Distraction', ms.distraction, false));
    sections.push('');
  }

  // ========== Career Stats ==========
  if (showCareerStats) {
    sections.push('CAREER STATS:');
    sections.push('');

    const stats = {
      'Races': `${driver.stats.races}`,
      'Wins': `${driver.stats.wins}`,
      'Top 5': `${driver.stats.top5}`,
      'Top 10': `${driver.stats.top10}`,
      'Poles': `${driver.stats.poles}`,
      'Laps Led': `${driver.stats.lapsLed}`,
      'Avg Finish': `${driver.stats.avgFinish.toFixed(1)}`,
    };

    sections.push(formatKeyValueTable(stats, 15));
    sections.push('');
  }

  // ========== Footer ==========
  sections.push(renderDivider(width));

  return sections.join('\n');
}

/**
 * Render a skill with progress bar
 */
function renderSkillBar(name: string, value: number): string {
  const bar = renderProgressBar(value, 100, 16);
  return `  ${name.padEnd(18)} ${bar}`;
}

/**
 * Render a mental state attribute with progress bar
 * @param isPositive - If true, higher is better; if false, lower is better
 */
function renderMentalStateBar(name: string, value: number, _isPositive: boolean): string {
  // Note: isPositive parameter reserved for future color coding implementation
  const bar = renderProgressBar(value, 100, 16);

  // Could add color indicators here later
  // Green for positive high values, red for negative high values
  return `  ${name.padEnd(18)} ${bar}`;
}

/**
 * Render compact driver info (single line)
 *
 * Example: "#42 Kyle Busch | Racecraft: 85 | Confidence: 72%"
 */
export function renderCompactDriverInfo(driver: Driver): string {
  return `#${driver.number} ${driver.name} | Racecraft: ${driver.skills.racecraft} | Confidence: ${driver.mentalState.confidence}%`;
}

/**
 * Render just the skills section
 */
export function renderSkillsOnly(skills: DriverSkills): string {
  const lines: string[] = ['SKILLS:'];

  lines.push(renderSkillBar('Racecraft', skills.racecraft));
  lines.push(renderSkillBar('Consistency', skills.consistency));
  lines.push(renderSkillBar('Aggression', skills.aggression));
  lines.push(renderSkillBar('Focus', skills.focus));
  lines.push(renderSkillBar('Stamina', skills.stamina));
  lines.push(renderSkillBar('Composure', skills.composure));
  lines.push(renderSkillBar('Draft Sense', skills.draftSense));
  lines.push(renderSkillBar('Tire Management', skills.tireManagement));
  lines.push(renderSkillBar('Fuel Management', skills.fuelManagement));
  lines.push(renderSkillBar('Pit Strategy', skills.pitStrategy));

  return lines.join('\n');
}

/**
 * Render just the mental state section
 */
export function renderMentalStateOnly(mentalState: MentalState): string {
  const lines: string[] = ['MENTAL STATE:'];

  lines.push(renderMentalStateBar('Confidence', mentalState.confidence, true));
  lines.push(renderMentalStateBar('Focus', mentalState.focus, true));
  lines.push(renderMentalStateBar('Frustration', mentalState.frustration, false));
  lines.push(renderMentalStateBar('Distraction', mentalState.distraction, false));

  return lines.join('\n');
}

/**
 * Render just the career stats section
 */
export function renderCareerStatsOnly(stats: CareerStats): string {
  const lines: string[] = ['CAREER STATS:'];

  const statsData = {
    'Races': `${stats.races}`,
    'Wins': `${stats.wins}`,
    'Top 5': `${stats.top5}`,
    'Top 10': `${stats.top10}`,
    'Poles': `${stats.poles}`,
    'Laps Led': `${stats.lapsLed}`,
    'Avg Finish': `${stats.avgFinish.toFixed(1)}`,
  };

  lines.push(formatKeyValueTable(statsData, 15));

  return lines.join('\n');
}

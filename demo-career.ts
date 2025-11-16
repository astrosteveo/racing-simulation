/**
 * Career Mode Demo
 * Demonstrates career progression through multiple races
 *
 * Run with: npx tsx demo-career.ts
 */

import { CareerManager } from './src/modes/career';
import { getDefaultSchedule, getRaceByNumber } from './src/modes/career';
import type { RaceResults, XPGain } from './src/types';
import * as readline from 'readline/promises';

/**
 * Simulate a race result based on driver skills
 * (Simplified for demo - in real game, this would be from RaceEngine)
 */
function simulateRace(
  driverSkills: number,
  raceNumber: number
): { results: RaceResults; mostLapsLed: boolean } {
  // Simulate finish position based on skills + some randomness
  const skillFactor = (driverSkills - 35) / 65; // Normalize rookie skills
  const randomness = (Math.random() - 0.5) * 0.4; // ±20%
  const performanceFactor = Math.max(0, Math.min(1, skillFactor + randomness));

  // Calculate finish position (better skills = better finish)
  const finishPosition = Math.max(1, Math.floor(40 - performanceFactor * 30));

  // Simulate laps led (better finish = more likely to lead)
  const lapsLed = finishPosition <= 5 ? Math.floor(Math.random() * 100) : Math.floor(Math.random() * 20);
  const mostLapsLed = finishPosition === 1 && Math.random() > 0.5;

  // Generate XP based on performance
  const baseXP = 100 - finishPosition * 2;
  const xpGained: XPGain[] = [
    { skill: 'racecraft', amount: baseXP + Math.random() * 50 },
    { skill: 'consistency', amount: baseXP * 0.7 + Math.random() * 30 },
    { skill: 'focus', amount: baseXP * 0.5 + Math.random() * 20 },
  ];

  const results: RaceResults = {
    finishPosition,
    startPosition: Math.floor(Math.random() * 30) + 5, // Random start 5-35
    positionsGained: 0, // Will calculate
    lapsLed,
    lapsCompleted: 500,
    fastestLap: 15.0 + Math.random() * 1.5,
    averageLap: 15.5 + Math.random() * 1.0,
    cleanLaps: 500 - Math.floor(Math.random() * 20),
    decisionsTotal: Math.floor(Math.random() * 5) + 2,
    decisionsCorrect: Math.floor(Math.random() * 4) + 1,
    xpGained,
  };

  results.positionsGained = results.startPosition - results.finishPosition;

  return { results, mostLapsLed };
}

/**
 * Display race results in a nice format
 */
function displayRaceResults(
  raceNumber: number,
  trackName: string,
  results: RaceResults,
  pointsAwarded: number
): void {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`   RACE ${raceNumber} RESULTS - ${trackName}`);
  console.log(`${'='.repeat(70)}`);
  console.log(`   Finish Position: P${results.finishPosition}`);
  console.log(`   Starting Position: P${results.startPosition}`);
  console.log(`   Positions Gained: ${results.positionsGained >= 0 ? '+' : ''}${results.positionsGained}`);
  console.log(`   Laps Led: ${results.lapsLed}`);
  console.log(`   Championship Points: +${pointsAwarded} points`);
  console.log(`${'='.repeat(70)}\n`);
}

/**
 * Display driver progression
 */
function displayDriverProgress(
  name: string,
  beforeSkills: { racecraft: number; consistency: number; focus: number },
  afterSkills: { racecraft: number; consistency: number; focus: number }
): void {
  console.log('   DRIVER PROGRESSION:');
  console.log(`   • Racecraft:   ${beforeSkills.racecraft.toFixed(1)} → ${afterSkills.racecraft.toFixed(1)} (+${(afterSkills.racecraft - beforeSkills.racecraft).toFixed(1)})`);
  console.log(`   • Consistency: ${beforeSkills.consistency.toFixed(1)} → ${afterSkills.consistency.toFixed(1)} (+${(afterSkills.consistency - beforeSkills.consistency).toFixed(1)})`);
  console.log(`   • Focus:       ${beforeSkills.focus.toFixed(1)} → ${afterSkills.focus.toFixed(1)} (+${(afterSkills.focus - beforeSkills.focus).toFixed(1)})`);
  console.log();
}

/**
 * Display season standings
 */
function displayStandings(season: number, race: number, points: number, stats: any): void {
  console.log(`\n   SEASON ${season} STANDINGS (After Race ${race - 1})`);
  console.log(`   ${'─'.repeat(50)}`);
  console.log(`   Championship Points: ${points}`);
  console.log(`   Races: ${stats.races} | Wins: ${stats.wins} | Top 5: ${stats.top5} | Top 10: ${stats.top10}`);
  console.log(`   Average Finish: ${stats.avgFinish.toFixed(1)}`);
  console.log(`   Laps Led: ${stats.lapsLed}`);
  console.log();
}

/**
 * Main demo function
 */
async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   NASCAR RPG RACING SIMULATION - CAREER MODE DEMO             ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Get driver info
  const driverName = await rl.question('Enter your driver name: ');
  const driverNumber = await rl.question('Enter your car number: ');

  // Create new career
  const manager = new CareerManager();
  const career = manager.startNewCareer(driverName, driverNumber);

  console.log(`\n✅ Career created for ${driverName} #${driverNumber}!`);
  console.log(`   Starting skills (rookie): ${career.driver.skills.racecraft.toFixed(0)} racecraft, ${career.driver.skills.consistency.toFixed(0)} consistency`);
  console.log(`   Unlocked tracks: ${career.unlockedTracks.join(', ')}`);

  await rl.question('\nPress Enter to start your rookie season...');

  // Get season schedule
  const schedule = getDefaultSchedule();

  // Run first 5 races of the season
  const racesToRun = 5;

  for (let i = 0; i < racesToRun; i++) {
    const currentRace = manager.getCurrentState().race;
    const raceInfo = getRaceByNumber(currentRace, schedule);

    if (!raceInfo) {
      console.log('Season complete!');
      break;
    }

    console.log(`\n${'▬'.repeat(70)}`);
    console.log(`   RACE ${currentRace} - ${raceInfo.trackId.toUpperCase()} (${raceInfo.laps} laps)`);
    console.log(`${'▬'.repeat(70)}`);

    await rl.question('Press Enter to race...');

    // Simulate race
    const beforeSkills = { ...manager.getCurrentState().driver.skills };
    const averageSkill = (beforeSkills.racecraft + beforeSkills.consistency + beforeSkills.focus) / 3;

    const { results, mostLapsLed } = simulateRace(averageSkill, currentRace);

    // Complete race
    manager.completeRace(results, mostLapsLed);

    // Get updated state
    const state = manager.getCurrentState();
    const afterSkills = state.driver.skills;

    // Calculate points awarded
    const pointsThisRace = state.points - (state.raceHistory[state.raceHistory.length - 2]?.positionsGained ?
      manager.getCurrentState().raceHistory.slice(0, -1).reduce((sum, r) => sum + 35, 0) : 0);

    // Display results
    displayRaceResults(currentRace, raceInfo.trackId.toUpperCase(), results, pointsThisRace);
    displayDriverProgress(driverName, beforeSkills, afterSkills);
    displayStandings(state.season, state.race, state.points, state.driver.stats);

    // Check for milestones
    if (results.finishPosition === 1 && state.driver.stats.wins === 1) {
      console.log('   🏆 MILESTONE: FIRST WIN! Amazing performance!');
    }
    if (results.finishPosition <= 5 && state.driver.stats.top5 === 1) {
      console.log('   🎯 MILESTONE: First top-5 finish!');
    }
    if (results.finishPosition <= 10 && state.driver.stats.top10 === 1) {
      console.log('   ✨ MILESTONE: First top-10 finish!');
    }
  }

  // Final summary
  const finalState = manager.getCurrentState();
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   CAREER MODE DEMO COMPLETE                                    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`   Driver: ${finalState.driver.name} #${finalState.driver.number}`);
  console.log(`   Season ${finalState.season}, Race ${finalState.race} (${racesToRun} races completed)`);
  console.log(`   Championship Points: ${finalState.points}`);
  console.log(`   Record: ${finalState.driver.stats.wins}W - ${finalState.driver.stats.top5}T5 - ${finalState.driver.stats.top10}T10`);
  console.log(`   Average Finish: ${finalState.driver.stats.avgFinish.toFixed(1)}`);
  console.log();
  console.log(`   Skill Growth:`);
  console.log(`   • Racecraft: ${career.driver.skills.racecraft.toFixed(0)} → ${finalState.driver.skills.racecraft.toFixed(1)}`);
  console.log(`   • Consistency: ${career.driver.skills.consistency.toFixed(0)} → ${finalState.driver.skills.consistency.toFixed(1)}`);
  console.log(`   • Focus: ${career.driver.skills.focus.toFixed(0)} → ${finalState.driver.skills.focus.toFixed(1)}`);
  console.log();
  console.log('   🎮 In the full game, you would continue racing through all 10 races,');
  console.log('   unlock new tracks, and progress through multiple seasons!');
  console.log();

  rl.close();
}

main().catch(console.error);

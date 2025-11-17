/**
 * NASCAR RPG Racing Simulation
 * Main Entry Point
 *
 * Run with: npx tsx src/index.ts
 */

import { MainMenu } from './ui/console/components/MainMenu';
import { CareerMenu } from './ui/console/components/CareerMenu';
import { showMenu, clearScreen, getTextInput, confirm, pressEnterToContinue } from './ui/console/input/MenuHandler';
import { CareerManager } from './modes/career/CareerManager';
import { CareerRaceRunner } from './modes/career/CareerRaceRunner';
import { getDefaultSchedule, getRaceByNumber } from './modes/career/SeasonSchedule';
import { calculateRacePoints } from './modes/career/ChampionshipPoints';
import fs from 'fs';
import path from 'path';

/**
 * List available save files
 */
function listSaveFiles(): string[] {
  const savesDir = path.join(process.cwd(), 'saves');

  if (!fs.existsSync(savesDir)) {
    return [];
  }

  const files = fs.readdirSync(savesDir);
  return files
    .filter(f => f.endsWith('.json') && !f.includes('-backup'))
    .map(f => f.replace('.json', ''));
}

/**
 * Display game title banner
 */
function displayBanner(): void {
  clearScreen();
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║         NASCAR RPG RACING SIMULATION                           ║');
  console.log('║                                                                ║');
  console.log('║         Real Physics • RPG Progression • Career Mode           ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
}

/**
 * Main menu flow
 */
async function showMainMenu(): Promise<string> {
  clearScreen();
  displayBanner();

  const mainMenu = new MainMenu();
  console.log(`${mainMenu.getTitle()}\n`);

  const selection = await showMenu(mainMenu.getMenuOptions(), mainMenu.getPrompt());
  return selection;
}

/**
 * Career mode flow
 */
async function careerModeFlow(): Promise<void> {
  clearScreen();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   CAREER MODE                                                  ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');

  const manager = new CareerManager();
  let saveId: string;

  // Check for existing saves
  const existingSaves = listSaveFiles();

  if (existingSaves.length > 0) {
    console.log('Existing careers found:');
    existingSaves.forEach((save, idx) => {
      console.log(`  ${idx + 1}. ${save}`);
    });
    console.log('');

    const loadExisting = await confirm('Load an existing career?', true);

    if (loadExisting) {
      if (existingSaves.length === 1) {
        saveId = existingSaves[0]!;
      } else {
        const saveChoice = await getTextInput('Enter save name to load', existingSaves[0]);
        saveId = saveChoice;
      }

      try {
        manager.load(saveId);
        console.log(`\n✅ Loaded career: ${saveId}`);
      } catch (error) {
        console.log(`\n❌ Failed to load career: ${error}`);
        console.log('Starting new career instead...\n');
        saveId = await createNewCareer(manager);
      }
    } else {
      saveId = await createNewCareer(manager);
    }
  } else {
    console.log('No existing careers found. Let\'s create one!\n');
    saveId = await createNewCareer(manager);
  }

  // Career menu loop
  await careerMenuLoop(manager, saveId);
}

/**
 * Create a new career
 */
async function createNewCareer(manager: CareerManager): Promise<string> {
  const driverName = await getTextInput('Enter your driver name');
  const driverNumber = await getTextInput('Enter your car number', '42');

  const career = manager.startNewCareer(driverName, driverNumber);
  const saveId = `career-${driverName.toLowerCase().replace(/\s+/g, '-')}`;

  console.log(`\n✅ Career created for ${driverName} #${driverNumber}!`);
  console.log(`   Starting skills (rookie): racecraft ${career.driver.skills.racecraft.toFixed(0)}, consistency ${career.driver.skills.consistency.toFixed(0)}`);
  console.log(`   Unlocked tracks: ${career.unlockedTracks.join(', ')}`);
  console.log('');

  // Save immediately
  manager.save(saveId);
  console.log(`💾 Career saved as: ${saveId}\n`);

  return saveId;
}

/**
 * Run the next race in career mode
 */
async function runNextRace(manager: CareerManager, saveId: string): Promise<void> {
  const state = manager.getCurrentState();
  const schedule = getDefaultSchedule();
  const raceInfo = getRaceByNumber(state.race, schedule);

  if (!raceInfo) {
    console.log('\n❌ No more races in schedule!');
    await pressEnterToContinue();
    return;
  }

  // Pre-race screen
  clearScreen();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   RACE START                                                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Season ${state.season} - Race ${state.race} of 10`);
  console.log(`Track: ${raceInfo.trackId.toUpperCase()}`);
  console.log(`Laps: ${raceInfo.laps}`);
  console.log('');
  console.log(`Driver: ${state.driver.name} #${state.driver.number}`);
  console.log(`Current Points: ${state.points}`);
  console.log('');

  const ready = await confirm('Ready to race?', true);
  if (!ready) {
    return;
  }

  // Run the race
  console.log('\n🏁 Racing...\n');
  console.log('Simulating race (this may take a moment)...\n');

  const raceRunner = new CareerRaceRunner();
  const results = raceRunner.runRace(state, state.race);

  // Calculate points
  const mostLapsLed = results.lapsLed > (results.lapsCompleted / 2);
  const pointsBreakdown = calculateRacePoints(results.finishPosition, results.lapsLed, mostLapsLed);

  // Post-race screen
  clearScreen();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   RACE RESULTS                                                 ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`${raceInfo.trackId.toUpperCase()} - Race ${state.race}`);
  console.log('');
  console.log(`   Finish Position: P${results.finishPosition}`);
  console.log(`   Start Position:  P${results.startPosition}`);
  console.log(`   Positions Gained: ${results.positionsGained >= 0 ? '+' : ''}${results.positionsGained}`);
  console.log('');
  console.log(`   Laps Led: ${results.lapsLed}${mostLapsLed ? ' (MOST LAPS LED! 🏆)' : ''}`);
  console.log(`   Fastest Lap: ${results.fastestLap.toFixed(3)}s`);
  console.log(`   Average Lap: ${results.averageLap.toFixed(3)}s`);
  console.log(`   Clean Laps: ${results.cleanLaps}/${results.lapsCompleted}`);
  console.log('');
  console.log('   CHAMPIONSHIP POINTS:');
  console.log(`   • Finish Position: +${pointsBreakdown.finishPoints} pts`);
  if (pointsBreakdown.lapsLedBonus > 0) {
    console.log(`   • Led a Lap: +${pointsBreakdown.lapsLedBonus} pts`);
  }
  if (pointsBreakdown.mostLapsLedBonus > 0) {
    console.log(`   • Most Laps Led: +${pointsBreakdown.mostLapsLedBonus} pts`);
  }
  console.log(`   • TOTAL: +${pointsBreakdown.totalPoints} pts`);
  console.log('');

  // Show XP gains
  if (results.xpGained.length > 0) {
    console.log('   SKILL IMPROVEMENTS:');
    const significantXP = results.xpGained.filter(xp => xp.amount > 20).sort((a, b) => b.amount - a.amount);
    significantXP.forEach((xp) => {
      const skillPoints = (xp.amount / 100).toFixed(2);
      console.log(`   • ${xp.skill}: +${skillPoints} skill points (${xp.amount.toFixed(0)} XP)`);
    });
    console.log('');
  }

  // Complete the race in career manager
  manager.completeRace(results, mostLapsLed);

  // Save progress
  manager.save(saveId);
  console.log('   💾 Progress saved!');
  console.log('');

  // Check for milestones
  const updatedState = manager.getCurrentState();
  if (results.finishPosition === 1) {
    if (updatedState.driver.stats.wins === 1) {
      console.log('   🏆 MILESTONE: FIRST WIN! Incredible performance!');
    } else {
      console.log('   🏆 RACE WIN! Another victory for your career!');
    }
  } else if (results.finishPosition <= 5 && updatedState.driver.stats.top5 === 1) {
    console.log('   🎯 MILESTONE: First top-5 finish!');
  } else if (results.finishPosition <= 10 && updatedState.driver.stats.top10 === 1) {
    console.log('   ✨ MILESTONE: First top-10 finish!');
  }

  // Check if season is complete
  if (manager.isSeasonComplete()) {
    console.log('');
    console.log('   🏁 SEASON COMPLETE!');
    console.log(`   Final Points: ${updatedState.points}`);
    console.log('');
    console.log('   Season summary and next season advancement coming soon!');
  }

  console.log('');
  await pressEnterToContinue();
}

/**
 * Career menu loop
 */
async function careerMenuLoop(manager: CareerManager, saveId: string): Promise<void> {
  let inCareerMode = true;

  while (inCareerMode) {
    const state = manager.getCurrentState();
    const careerMenu = new CareerMenu(state);

    clearScreen();
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log(`║   ${careerMenu.getTitle().padEnd(61)} ║`);
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(careerMenu.getCareerSummary());
    console.log('');

    const selection = await showMenu(careerMenu.getMenuOptions(), careerMenu.getPrompt());

    switch (selection) {
      case 'next-race':
        await runNextRace(manager, saveId);
        break;

      case 'standings':
        displayStandings(manager);
        await confirm('Press Enter to continue', true);
        break;

      case 'driver-profile':
        displayDriverProfile(manager);
        await confirm('Press Enter to continue', true);
        break;

      case 'season-schedule':
        displaySeasonSchedule(manager);
        await confirm('Press Enter to continue', true);
        break;

      case 'save-exit':
        manager.save(saveId);
        console.log(`\n💾 Career saved!`);
        inCareerMode = false;
        break;

      default:
        console.log(`\n❌ Unknown option: ${selection}`);
    }
  }
}

/**
 * Display championship standings
 */
function displayStandings(manager: CareerManager): void {
  const state = manager.getCurrentState();

  clearScreen();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   CHAMPIONSHIP STANDINGS                                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Season ${state.season} - After Race ${state.race - 1}\n`);
  console.log('─'.repeat(60));
  console.log(`  1. ${state.driver.name.padEnd(30)} ${state.points.toString().padStart(5)} pts`);
  console.log('─'.repeat(60));
  console.log('');
  console.log('Note: Full standings with AI drivers coming soon!');
  console.log('');
}

/**
 * Display driver profile
 */
function displayDriverProfile(manager: CareerManager): void {
  const state = manager.getCurrentState();
  const { driver } = state;

  clearScreen();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   DRIVER PROFILE                                               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`${driver.name} #${driver.number}\n`);

  console.log('SKILLS:');
  console.log(`  Racecraft:        ${driver.skills.racecraft.toFixed(1)}`);
  console.log(`  Consistency:      ${driver.skills.consistency.toFixed(1)}`);
  console.log(`  Aggression:       ${driver.skills.aggression.toFixed(1)}`);
  console.log(`  Focus:            ${driver.skills.focus.toFixed(1)}`);
  console.log(`  Stamina:          ${driver.skills.stamina.toFixed(1)}`);
  console.log(`  Composure:        ${driver.skills.composure.toFixed(1)}`);
  console.log(`  Draft Sense:      ${driver.skills.draftSense.toFixed(1)}`);
  console.log(`  Tire Management:  ${driver.skills.tireManagement.toFixed(1)}`);
  console.log(`  Fuel Management:  ${driver.skills.fuelManagement.toFixed(1)}`);
  console.log(`  Pit Strategy:     ${driver.skills.pitStrategy.toFixed(1)}`);
  console.log('');

  console.log('CAREER STATS:');
  console.log(`  Races:            ${driver.stats.races}`);
  console.log(`  Wins:             ${driver.stats.wins}`);
  console.log(`  Top 5:            ${driver.stats.top5}`);
  console.log(`  Top 10:           ${driver.stats.top10}`);
  console.log(`  Poles:            ${driver.stats.poles}`);
  console.log(`  Laps Led:         ${driver.stats.lapsLed}`);
  console.log(`  Average Finish:   ${driver.stats.avgFinish.toFixed(1)}`);
  console.log('');
}

/**
 * Display season schedule
 */
function displaySeasonSchedule(manager: CareerManager): void {
  const state = manager.getCurrentState();
  const schedule = getDefaultSchedule();

  clearScreen();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   SEASON SCHEDULE                                              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Season ${state.season} - 10 Race Schedule\n`);
  console.log('─'.repeat(60));

  schedule.forEach((race, idx) => {
    const raceNum = idx + 1;
    const status = raceNum < state.race ? '✅' : raceNum === state.race ? '▶' : '⏸';
    const trackName = race.trackId.charAt(0).toUpperCase() + race.trackId.slice(1);

    console.log(`  ${status} Race ${raceNum}: ${trackName.padEnd(15)} (${race.laps} laps)`);
  });

  console.log('─'.repeat(60));
  console.log('');
}

/**
 * Settings flow (placeholder)
 */
async function settingsFlow(): Promise<void> {
  clearScreen();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   SETTINGS                                                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Settings menu coming soon!');
  console.log('');
  await confirm('Press Enter to return to main menu', true);
}

/**
 * Quick race flow (placeholder)
 */
async function quickRaceFlow(): Promise<void> {
  clearScreen();
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   QUICK RACE                                                   ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Quick race mode coming soon!');
  console.log('For now, try: npm run play');
  console.log('');
  await confirm('Press Enter to return to main menu', true);
}

/**
 * Main game loop
 */
async function main(): Promise<void> {
  let running = true;

  while (running) {
    const selection = await showMainMenu();

    switch (selection) {
      case 'quick-race':
        await quickRaceFlow();
        break;

      case 'career-mode':
        await careerModeFlow();
        break;

      case 'settings':
        await settingsFlow();
        break;

      case 'quit':
        clearScreen();
        console.log('\nThanks for playing NASCAR RPG Racing Simulation!\n');
        running = false;
        break;

      default:
        console.log(`\nUnknown selection: ${selection}`);
    }
  }
}

// Run the game
main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

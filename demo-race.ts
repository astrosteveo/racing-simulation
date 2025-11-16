/**
 * Demo Race Script
 * Tests the Console UI with a complete race simulation
 *
 * Run with: npx tsx demo-race.ts
 */

import { RaceEngine } from './src/engine/simulation/race';
import { ConsoleRenderer } from './src/ui/console';
import {
  bristolTrack,
  createPlayerDriver,
  createAIField,
} from './tests/fixtures/mock-data';

async function main() {
  console.log('NASCAR RPG Racing Simulation - Demo');
  console.log('====================================\n');

  // Initialize console renderer
  const renderer = new ConsoleRenderer({ width: 70, autoClear: true });

  // Create race configuration
  const track = bristolTrack;
  const playerDriver = createPlayerDriver('Kyle Busch', '42', 'midpack');
  const aiDrivers = createAIField(39); // 39 AI drivers (40 total field)

  const raceConfig = {
    track,
    laps: 100, // Shortened race for demo
    playerDriver,
    aiDrivers,
    startingPosition: 20, // Start mid-pack
  };

  // Initialize race engine
  const engine = new RaceEngine();
  engine.initialize(raceConfig);

  console.log(`Track: ${track.name}`);
  console.log(`Distance: ${raceConfig.laps} laps`);
  console.log(`Field: 40 cars`);
  console.log(`Your car: #${playerDriver.number} ${playerDriver.name}`);
  console.log(`Starting position: P${raceConfig.startingPosition || 'random'}\n`);

  // Ask user if ready
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  await new Promise<void>(resolve => {
    rl.question('Press Enter to start the race...', () => {
      rl.close();
      resolve();
    });
  });

  // Start race
  engine.start();

  // Race loop
  while (!engine.isComplete()) {
    // Simulate one lap
    engine.simulateLap();

    // Get current state
    const state = engine.getCurrentState();

    // Render race state
    renderer.render(state);

    // Simulate delay between laps (can be skipped for faster demo)
    await sleep(100); // 100ms per lap

    // Every 10 laps, wait for user input
    if (state.currentLap % 10 === 0 && state.currentLap < state.totalLaps) {
      const readlineModule = await import('readline');
      await new Promise<void>(resolve => {
        const rl2 = readlineModule.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        rl2.question('\n[Paused - Press Enter to continue...]', () => {
          rl2.close();
          resolve();
        });
      });
    }
  }

  // Show final results
  const results = engine.getResults();
  renderer.showResults(results);

  console.log('\nRace complete! Thanks for testing the demo.\n');
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the demo
main().catch(console.error);

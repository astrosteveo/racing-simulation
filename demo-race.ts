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

  // Real-time racing configuration
  const TICK_INTERVAL_MS = 100; // Update every 100ms (10 FPS)
  const RENDER_INTERVAL = 5; // Render every 5 ticks (~500ms) for readability
  let tickCount = 0;
  let lastLapCount = 0;

  console.log('\n🏁 Race Started! Real-time racing in progress...\n');

  // Real-time race loop (Phase 7)
  // Uses tick-based simulation where lap times match actual physics calculations
  while (!engine.isComplete()) {
    // Simulate time progression (100ms of race time)
    engine.simulateTick(TICK_INTERVAL_MS);

    // Get current state
    const state = engine.getCurrentState();

    // Render at regular intervals (not every tick, for readability)
    if (tickCount % RENDER_INTERVAL === 0) {
      renderer.render(state);
    }

    // Check for active decision
    if (state.activeDecision) {
      console.log('\n🏁 DECISION TIME! 🏁\n');

      // Pause the race
      engine.pause();

      // Prompt player for decision
      const choice = await renderer.promptDecision(state.activeDecision);

      // Apply the decision
      engine.applyDecision(state.activeDecision, choice);

      // Show updated state after decision
      const updatedState = engine.getCurrentState();
      console.log('\n📊 Decision Applied!\n');
      renderer.render(updatedState);

      // Resume the race
      engine.resume();

      // Brief pause to see the result
      await sleep(1500);
    }

    // Wait for next tick (real-time pacing)
    await sleep(TICK_INTERVAL_MS);

    // Every 10 laps, pause for user pacing
    if (state.currentLap % 10 === 0 && state.currentLap !== lastLapCount && state.currentLap < state.totalLaps && !state.activeDecision) {
      lastLapCount = state.currentLap;
      engine.pause();

      const readlineModule = await import('readline');
      await new Promise<void>(resolve => {
        const rl2 = readlineModule.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        rl2.question(`\n[Lap ${state.currentLap} - Press Enter to continue...]`, () => {
          rl2.close();
          resolve();
        });
      });

      engine.resume();
    }

    tickCount++;
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

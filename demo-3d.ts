/**
 * 3D Race Demo with WebSocket Server
 * Runs race simulation and broadcasts state to Godot client
 *
 * Run with: npx tsx demo-3d.ts
 */

import { WebSocketServer } from 'ws';
import { RaceEngine } from './src/engine/simulation/race.js';
import {
  bristolTrack,
  createPlayerDriver,
  createAIField,
} from './tests/fixtures/mock-data.js';

const PORT = 8080;

// Bristol track dimensions (must match track.gd in Godot)
const TURN_RADIUS = 140;
const STRAIGHT_LENGTH = 700;

function calculateTrackPosition(progress: number): { x: number; y: number; z: number; heading: number } {
  // Normalize progress to 0-1
  const p = progress % 1.0;
  const section = Math.floor(p * 4);
  const sectionProgress = (p * 4) % 1;

  switch (section) {
    case 0: // Bottom turn (0-0.25): Arc from 0 to PI
      {
        const angle = sectionProgress * Math.PI;
        return {
          x: TURN_RADIUS * Math.cos(angle),
          y: 0,
          z: TURN_RADIUS * Math.sin(angle),
          heading: angle + Math.PI / 2,
        };
      }
    case 1: // Right straight (0.25-0.5): Z from 0 to STRAIGHT_LENGTH
      return {
        x: TURN_RADIUS,
        y: 0,
        z: sectionProgress * STRAIGHT_LENGTH,
        heading: Math.PI / 2,
      };
    case 2: // Top turn (0.5-0.75): Arc from PI to 0
      {
        const angle = Math.PI * (1 - sectionProgress);
        return {
          x: TURN_RADIUS * Math.cos(angle),
          y: 0,
          z: STRAIGHT_LENGTH + TURN_RADIUS * Math.sin(angle),
          heading: angle + Math.PI / 2,
        };
      }
    case 3: // Left straight (0.75-1.0): Z from STRAIGHT_LENGTH to 0
    default:
      return {
        x: -TURN_RADIUS,
        y: 0,
        z: STRAIGHT_LENGTH - sectionProgress * STRAIGHT_LENGTH,
        heading: -Math.PI / 2,
      };
  }
}

async function main() {
  console.log('NASCAR RPG Racing Simulation - 3D Demo');
  console.log('=======================================\n');

  // Start WebSocket server
  const wss = new WebSocketServer({ port: PORT });
  console.log(`WebSocket server started on ws://localhost:${PORT}`);

  const clients: Set<any> = new Set();

  wss.on('connection', (ws) => {
    console.log('✅ Godot client connected');
    clients.add(ws);

    ws.on('close', () => {
      console.log('❌ Godot client disconnected');
      clients.delete(ws);
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received from client:', message.type);
      } catch (err) {
        console.error('Invalid message from client:', err);
      }
    });
  });

  // Broadcast function
  function broadcast(message: any) {
    const data = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === 1) {
        // OPEN
        client.send(data);
      }
    });
  }

  // Create race configuration
  const track = bristolTrack;
  const playerDriver = createPlayerDriver('Kyle Busch', '42', 'midpack');
  const aiDrivers = createAIField(39);

  const raceConfig = {
    track,
    laps: 100,
    playerDriver,
    aiDrivers,
    startingPosition: 20,
  };

  // Initialize race engine
  const engine = new RaceEngine();
  engine.initialize(raceConfig);
  engine.start();

  console.log(`Track: ${track.name}`);
  console.log(`Distance: ${raceConfig.laps} laps`);
  console.log(`Field: 40 cars`);
  console.log(`Your car: #${playerDriver.number} ${playerDriver.name}`);
  console.log(`Starting position: P${raceConfig.startingPosition || 'random'}\n`);
  console.log('Waiting for Godot client to connect...\n');

  // Wait a moment for client to connect
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('Starting race simulation...\n');

  // Run race simulation with broadcasting
  let lastBroadcast = 0;
  let lastTick = Date.now();
  const BROADCAST_INTERVAL = 100; // Broadcast every 100ms (10Hz)
  const TICK_RATE = 16; // ~60 ticks per second

  while (!engine.isComplete()) {
    const now = Date.now();
    const deltaMs = now - lastTick;

    engine.simulateTick(deltaMs);
    lastTick = now;

    if (now - lastBroadcast >= BROADCAST_INTERVAL) {
      const state = engine.getCurrentState();

      // Broadcast race state
      const cars = state.positions.map((pos) => {
        const progress = state.lapProgress?.find((lp) => lp.driverId === pos.driverId)?.progress ?? 0;
        const trackPos = calculateTrackPosition(progress);

        return {
          id: pos.driverId,
          number: pos.driverId, // Using ID as number for now
          name: pos.driverName,
          position: pos.position,
          lapProgress: progress,
          coordinates: trackPos,
          rotation: {
            x: 0,
            y: trackPos.heading,
            z: 0,
            w: 1,
          },
          speed: 150, // Placeholder
          tireWear: state.playerCar.tireWear,
          fuelRemaining: state.playerCar.fuelLevel,
        };
      });

      const playerProgress = state.lapProgress?.find((lp) => lp.driverId === state.playerDriver.id)?.progress ?? 0;
      const playerTrackPos = calculateTrackPosition(playerProgress);

      broadcast({
        type: 'RaceStateUpdate',
        data: {
          tick: state.currentLap * 1000, // Use lap as tick approximation
          raceTime: state.currentLap * 30, // Approximate race time
          currentLap: state.currentLap,
          totalLaps: state.totalLaps,
          cars,
          playerCar: {
            id: state.playerDriver.id,
            coordinates: playerTrackPos,
            rotation: {
              x: 0,
              y: playerTrackPos.heading,
              z: 0,
              w: 1,
            },
            speed: 150,
            tireWear: state.playerCar.tireWear,
            fuelRemaining: state.playerCar.fuelLevel,
          },
        },
      });

      lastBroadcast = now;
    }

    // Small delay to prevent CPU overload
    await new Promise((resolve) => setImmediate(resolve));
  }

  const finalState = engine.getCurrentState();
  console.log('\n\n🏁 Race Complete!');
  console.log(`Winner: ${finalState.positions[0].driverName}`);
  console.log(`Your finish: P${finalState.playerPosition}`);

  console.log('\nWebSocket server still running. Press Ctrl+C to exit.');
}

main().catch(console.error);

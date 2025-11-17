/**
 * NASCAR RPG Racing Simulation - 3D Client
 * Entry point for the Three.js visualization client
 */

import * as THREE from 'three';
import { EngineBridge, type RaceStateUpdate } from './engine-bridge';
import { TrackLoader } from './track/track-loader';
import { TrackRenderer } from './track/track-renderer';
import bristolData from '../../src/data/tracks/bristol.json';

// Hide loading screen once initialized
function hideLoading() {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('hidden');
  }
}

// Initialize Three.js scene
function initScene(): { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer } {
  const container = document.getElementById('canvas-container');
  if (!container) {
    throw new Error('Canvas container not found');
  }

  // Create scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb); // Sky blue

  // Create camera
  const camera = new THREE.PerspectiveCamera(
    75, // FOV
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near plane
    10000 // Far plane
  );
  camera.position.set(0, 50, 100);
  camera.lookAt(0, 0, 0);

  // Create renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  // Add basic lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1000, 1000, 500);
  scene.add(directionalLight);

  // Add ground plane (infield grass)
  const groundGeometry = new THREE.PlaneGeometry(3000, 3000);
  const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x228822 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  scene.add(ground);

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer };
}

// Animation loop
function animate(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
) {
  requestAnimationFrame(() => animate(scene, camera, renderer));
  renderer.render(scene, camera);
}

// Update HUD with race state
function updateHUD(state: RaceStateUpdate) {
  const positionWidget = document.getElementById('position-widget');
  const lapWidget = document.getElementById('lap-widget');
  const gapWidget = document.getElementById('gap-widget');
  const tireWidget = document.getElementById('tire-widget');
  const fuelWidget = document.getElementById('fuel-widget');

  if (positionWidget) {
    positionWidget.textContent = `P${state.playerCar.position} / 40`;
  }

  if (lapWidget) {
    lapWidget.textContent = `Lap ${state.currentLap} / --`;
  }

  if (gapWidget) {
    // TODO: Calculate gap from leaderboard once available
    gapWidget.textContent = `Gap: --`;
  }

  if (tireWidget) {
    tireWidget.textContent = `Tires: ${Math.round(state.playerCar.tireWear)}%`;
  }

  if (fuelWidget) {
    fuelWidget.textContent = `Fuel: ${Math.round(state.playerCar.fuelLevel)}%`;
  }
}

// Main initialization
async function main() {
  console.log('🏁 NASCAR RPG Racing Simulation - 3D Client Starting...');

  try {
    const { scene, camera, renderer } = initScene();
    console.log('✅ Three.js scene initialized');

    // Load and render Bristol Motor Speedway
    console.log('Loading Bristol Motor Speedway...');
    const trackLoader = new TrackLoader();
    const trackRenderer = new TrackRenderer(scene);

    const trackGeometry = await trackLoader.load(bristolData as any);
    trackRenderer.render(trackGeometry);
    console.log(`✅ ${trackGeometry.name} loaded and rendered`);

    // Position camera to view the track
    camera.position.set(0, 400, 600);
    camera.lookAt(0, 0, 0);

    // Connect to game engine
    const ENGINE_URL = 'ws://localhost:8080'; // TODO: Make configurable
    const bridge = new EngineBridge(ENGINE_URL, {
      onConnect: () => {
        console.log('✅ Connected to game engine');
      },
      onDisconnect: () => {
        console.warn('⚠️ Disconnected from game engine');
      },
      onRaceStateUpdate: (state) => {
        updateHUD(state);
      },
      onDecisionPrompt: (prompt) => {
        console.log('🤔 Decision required:', prompt.situation);
        // TODO: Show decision UI
      },
      onRaceEvent: (event) => {
        console.log(`📢 Race event: ${event.message}`);
      },
      onError: (error) => {
        console.error('❌ Engine connection error:', error);
      },
    });

    // Attempt to connect (will fail gracefully if engine not running)
    try {
      bridge.connect();
    } catch (error) {
      console.warn('Engine not available, running in standalone mode');
    }

    hideLoading();
    animate(scene, camera, renderer);

    console.log('✅ Client ready!');
  } catch (error) {
    console.error('❌ Failed to initialize client:', error);
  }
}

// Start the application
main();

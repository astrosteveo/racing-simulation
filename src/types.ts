/**
 * NASCAR RPG Racing Simulation - Type Definitions
 *
 * This file contains ALL TypeScript interfaces and types for the simulation.
 * These contracts define how all systems communicate.
 *
 * IMPORTANT: All implementations must conform to these interfaces.
 * Changing an interface requires updating all implementations.
 */

// ============================================================================
// DRIVER & CHARACTER SYSTEM
// ============================================================================

/**
 * Core driver skills (0-100 scale)
 * These are persistent stats that improve through XP
 */
export interface DriverSkills {
  racecraft: number;        // Overall racing ability
  consistency: number;      // Ability to maintain pace
  aggression: number;       // Willingness to take risks
  focus: number;            // Mental sharpness
  stamina: number;          // Physical endurance
  composure: number;        // Emotional control under pressure

  // Specialized skills
  draftSense: number;       // Reading aerodynamic situations
  tireManagement: number;   // Preserving tire life
  fuelManagement: number;   // Efficient fuel usage
  pitStrategy: number;      // Understanding pit timing
}

/**
 * Mental state (0-100 scale)
 * Dynamic attributes that change during each race
 */
export interface MentalState {
  confidence: number;       // Self-belief, affects performance positively
  frustration: number;      // Annoyance/anger, affects performance negatively
  focus: number;            // Concentration level, affects mistakes
  distraction: number;      // Mental noise, reduces performance
}

/**
 * Career statistics for a driver
 */
export interface CareerStats {
  races: number;            // Total races run
  wins: number;             // Race victories
  top5: number;             // Top 5 finishes
  top10: number;            // Top 10 finishes
  poles: number;            // Pole positions
  lapsLed: number;          // Total laps led
  avgFinish: number;        // Average finish position
}

/**
 * XP gain structure for skill progression
 */
export interface XPGain {
  racecraft?: number;
  consistency?: number;
  aggression?: number;
  focus?: number;
  stamina?: number;
  composure?: number;
  draftSense?: number;
  tireManagement?: number;
  fuelManagement?: number;
  pitStrategy?: number;
}

/**
 * Complete driver definition
 */
export interface Driver {
  id: string;               // Unique identifier
  name: string;             // Driver name
  number: string;           // Car number
  isPlayer: boolean;        // True if this is the player
  skills: DriverSkills;     // Current skill levels
  mentalState: MentalState; // Current mental state
  stats: CareerStats;       // Career statistics
}

/**
 * Driver state for physics calculations
 * Subset of Driver interface containing only what physics engine needs
 */
export interface DriverState {
  skills: DriverSkills;     // Driver skill levels
  mentalState: MentalState; // Current mental state
}

// ============================================================================
// TRACK SYSTEM
// ============================================================================

/**
 * Track types
 */
export type TrackType = 'short' | 'intermediate' | 'superspeedway' | 'road';

/**
 * Track surface types
 */
export type SurfaceType = 'concrete' | 'asphalt';

/**
 * Individual track section (turn or straight)
 */
export interface TrackSection {
  type: 'straight' | 'turn';
  length: number;           // Length in feet
  banking?: number;         // Banking angle in degrees (for turns)
  radius?: number;          // Turn radius in feet (for turns)
  idealLine: number;        // Ideal speed through section (MPH)
  surfaceGrip: number;      // Grip multiplier 0.8-1.0
}

/**
 * Complete track definition
 */
export interface Track {
  id: string;               // Unique identifier
  name: string;             // Full track name
  nickname?: string;        // Track nickname
  length: number;           // Track length in miles
  type: TrackType;          // Track category
  banking: {
    turns: number;          // Average turn banking in degrees
    straights: number;      // Straight banking in degrees
  };
  surface: SurfaceType;     // Track surface material
  surfaceGrip: number;      // Base grip level 0.8-1.0
  sections: TrackSection[]; // Track divided into sections
  difficulty: number;       // Difficulty rating 1-10
  raceLaps: number;         // Standard race distance in laps
}

// ============================================================================
// CAR & VEHICLE SYSTEM
// ============================================================================

/**
 * Car specifications (NASCAR spec)
 */
export interface Car {
  horsepower: number;       // Engine horsepower (~750)
  weight: number;           // Car weight in pounds (~3400)
  dragCoefficient: number;  // Aerodynamic drag (~0.32)
  downforce: number;        // Downforce value
  tireCompound: string;     // Tire type/compound
  fuelCapacity: number;     // Fuel tank capacity in gallons (~18)
}

/**
 * Dynamic car state during race
 */
export interface CarState {
  tireWear: number;         // Tire condition 0-100%
  fuelLevel: number;        // Fuel remaining 0-100%
  damage: number;           // Damage level 0-100%
  inPit: boolean;           // Currently in pit lane
  lapsSincePit: number;     // Laps since last pit stop
  fuelConsumptionPerLap?: number; // Last lap fuel consumption in gallons (optional tracking)
}

// ============================================================================
// RACE SYSTEM
// ============================================================================

/**
 * Position in race
 */
export interface Position {
  position: number;         // Current position (1-40)
  driverId: string;         // Driver ID
  driverName: string;       // Driver name
  lapTime: number;          // Last lap time in seconds
  gapToLeader: number;      // Gap to leader in seconds
  gapToNext: number;        // Gap to car ahead in seconds
  lapsLed: number;          // Laps led this race
  gap?: number;             // Optional: Gap to leader (alternate field for real-time mode)
  fastestLap?: number;      // Optional: Fastest lap time (used in real-time mode)
}

/**
 * Race event (incident, milestone, etc.)
 */
export interface RaceEvent {
  lap: number;              // Lap number when occurred
  type: string;             // Event type
  description: string;      // Human-readable description
  driversInvolved: string[]; // Driver IDs involved
  severity?: 'minor' | 'major' | 'critical';
}

/**
 * Lap progress for a single driver (0-1, where 1.0 = lap complete)
 */
export interface LapProgress {
  driverId: string;         // Driver ID
  progress: number;         // Lap completion (0.0 to 1.0)
}

/**
 * Current race state snapshot
 */
export interface RaceState {
  currentLap: number;       // Current lap number
  totalLaps: number;        // Total laps in race
  positions: Position[];    // Current race order
  leaderLapTime: number;    // Leader's last lap time
  playerPosition: number;   // Player's current position
  playerDriver: Driver;     // Player driver state
  playerCar: CarState;      // Player car state
  track: Track;             // Track being raced on
  activeDecision: Decision | null; // Pending decision (if any)
  raceEvents: RaceEvent[];  // Recent race events
  caution: boolean;         // Caution flag status
  lapProgress: LapProgress[]; // Real-time lap progress for all drivers (Phase 7)
}

/**
 * Race configuration
 */
export interface RaceConfig {
  track: Track;             // Track to race on
  laps: number;             // Number of laps
  playerDriver: Driver;     // Player's driver
  aiDrivers: Driver[];      // AI competitor drivers
  startingPosition?: number; // Player starting position (random if not specified)
}

/**
 * Race results
 */
export interface RaceResults {
  finishPosition: number;   // Final position
  startPosition: number;    // Starting position
  positionsGained: number;  // Net positions gained/lost
  lapsLed: number;          // Laps led
  lapsCompleted: number;    // Laps completed
  fastestLap: number;       // Fastest lap time
  averageLap: number;       // Average lap time
  cleanLaps: number;        // Laps without incidents
  decisionsTotal: number;   // Total decisions made
  decisionsCorrect: number; // Good decisions made
  xpGained: XPGain[];       // XP earned from race
  issues?: string[];        // Problems encountered (if any)
}

// ============================================================================
// DECISION SYSTEM
// ============================================================================

/**
 * Decision types
 */
export type DecisionType =
  | 'pit-strategy'
  | 'passing'
  | 'traffic-management'
  | 'incident-response'
  | 'tire-management'
  | 'mental-state';

/**
 * Risk level for decision option
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * Success outcome for decision
 */
export type DecisionOutcome = 'success' | 'neutral' | 'failure';

/**
 * Single decision option
 */
export interface DecisionOption {
  id: string;               // Unique option identifier
  label: string;            // Short label (for UI)
  description: string;      // Detailed description
  riskLevel: RiskLevel;     // Risk assessment
  skillRequirements?: Partial<DriverSkills>; // Skills that affect outcome
}

/**
 * Race context for decision making
 */
export interface RaceContext {
  lap: number;              // Current lap
  position: number;         // Current position
  lapsToGo: number;         // Laps remaining
  gapToLeader: number;      // Gap to leader
  gapToNext: number;        // Gap to car ahead
  tireWear: number;         // Current tire condition
  fuelLevel: number;        // Current fuel level
  mentalState: MentalState; // Current mental state
}

/**
 * Decision prompt for player
 */
export interface Decision {
  id: string;               // Unique decision ID
  type: DecisionType;       // Decision category
  prompt: string;           // Question/situation description
  options: DecisionOption[]; // Available choices
  timeLimit: number;        // Seconds to decide
  defaultOption: string;    // Default choice ID (if timeout)
  context: RaceContext;     // Current race situation
}

/**
 * Effects of decision outcome
 */
export interface DecisionEffects {
  positionChange?: number;  // Positions gained/lost
  mentalStateChange?: Partial<MentalState>; // Mental state adjustments
  tireWearChange?: number;  // Tire condition change
  fuelChange?: number;      // Fuel level change
  damageChange?: number;    // Damage sustained
}

/**
 * Result of evaluating a decision
 */
export interface DecisionResult {
  optionChosen: string;     // Option ID selected
  outcome: DecisionOutcome; // Success/neutral/failure
  effects: DecisionEffects; // What changed
  xpGained: XPGain;         // XP earned from decision
  message?: string;         // Outcome description (optional)
}

// ============================================================================
// PHYSICS & SIMULATION
// ============================================================================

/**
 * Physics calculation parameters
 */
export interface PhysicsParams {
  horsepower: number;
  weight: number;
  dragCoefficient: number;
  downforce: number;
  banking: number;
  radius: number;
  tireGrip: number;         // 0.0-1.0
  fuelWeight: number;       // Additional weight from fuel
  driverSkill: number;      // Driver skill modifier
  mentalStateModifier: number; // Mental state effect
}

/**
 * Draft status for aerodynamic calculations
 */
export interface DraftStatus {
  inDraft: boolean;         // Currently drafting
  distance: number;         // Distance to car ahead (car lengths)
  speedBoost: number;       // Speed increase from draft (MPH)
  fuelSavings: number;      // Fuel consumption reduction (%)
}

/**
 * Lap time breakdown
 */
export interface LapTimeBreakdown {
  totalTime: number;        // Total lap time
  sectionTimes: number[];   // Time for each section
  averageSpeed: number;     // Average speed in MPH
  topSpeed: number;         // Max speed achieved
}

// ============================================================================
// AI SYSTEM
// ============================================================================

/**
 * AI driver personality traits
 */
export interface AIPersonality {
  aggression: number;       // 0-100: conservative to aggressive
  riskTolerance: number;    // 0-100: safe to risky
  adaptability: number;     // 0-100: stubborn to adaptive
  consistency: number;      // 0-100: erratic to consistent
}

/**
 * AI driver definition (extends Driver)
 */
export interface AIDriver extends Driver {
  personality: AIPersonality; // AI behavior traits
  difficulty: 'rookie' | 'amateur' | 'professional' | 'elite';
}

// ============================================================================
// GAME STATE & MANAGEMENT
// ============================================================================

/**
 * Career mode save data
 */
export interface CareerSave {
  driverId: string;         // Player driver ID
  driver: Driver;           // Driver state
  season: number;           // Current season
  race: number;             // Current race in season
  points: number;           // Championship points
  unlockedTracks: string[]; // Track IDs unlocked
  raceHistory: RaceResults[]; // Past race results
}

/**
 * Menu option
 */
export interface MenuOption {
  id: string;               // Option ID
  label: string;            // Display text
  description?: string;     // Optional description
  disabled?: boolean;       // Whether option is available
}

// ============================================================================
// UI SYSTEM
// ============================================================================

/**
 * UI renderer interface
 * Different UIs (console, web, 3D) implement this
 */
export interface UIRenderer {
  /**
   * Render current race state
   */
  render(state: RaceState): void;

  /**
   * Prompt player for decision
   * Returns chosen option ID
   */
  promptDecision(decision: Decision): Promise<string>;

  /**
   * Show race results
   */
  showResults(results: RaceResults): void;

  /**
   * Show menu and get selection
   * Returns selected option ID
   */
  showMenu(options: MenuOption[]): Promise<string>;

  /**
   * Clear display
   */
  clear(): void;
}

// ============================================================================
// ENGINE INTERFACES
// ============================================================================

/**
 * Physics engine interface
 */
export interface PhysicsEngine {
  /**
   * Calculate lap time for given driver/track/car combo
   */
  calculateLapTime(
    driver: Driver,
    track: Track,
    carState: CarState,
    draft?: DraftStatus
  ): number;

  /**
   * Calculate tire wear for given conditions
   */
  calculateTireWear(
    laps: number,
    aggression: number,
    trackType: TrackType
  ): number;

  /**
   * Calculate fuel consumption per lap
   */
  calculateFuelConsumption(
    driver: Driver,
    track: Track,
    carState: CarState,
    draftStatus: DraftStatus
  ): number;

  /**
   * Calculate draft effect
   */
  calculateDraftEffect(distance: number): DraftStatus;

  /**
   * Calculate passing probability
   */
  calculatePassProbability(
    attacker: Driver,
    defender: Driver,
    section: TrackSection
  ): number;
}

/**
 * Race simulation interface
 */
export interface RaceSimulation {
  /**
   * Initialize race with configuration
   */
  initialize(config: RaceConfig): void;

  /**
   * Start the race
   */
  start(): void;

  /**
   * Simulate one lap
   */
  simulateLap(): void;

  /**
   * Get current race state
   */
  getCurrentState(): RaceState;

  /**
   * Apply player decision
   */
  applyDecision(decision: Decision, choice: string): void;

  /**
   * Check if race is complete
   */
  isComplete(): boolean;

  /**
   * Get final race results
   */
  getResults(): RaceResults;

  /**
   * Pause race
   */
  pause(): void;

  /**
   * Resume race
   */
  resume(): void;
}

/**
 * Decision manager interface
 */
export interface DecisionManager {
  /**
   * Check if a decision should be triggered
   * Returns Decision if one should occur, null otherwise
   */
  shouldTriggerDecision(state: RaceState): Decision | null;

  /**
   * Evaluate player's decision choice
   */
  evaluateDecision(
    decision: Decision,
    choice: string,
    driver: Driver
  ): DecisionResult;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Range type for bounded numbers
 */
export type Range<T extends number> = T;

/**
 * Percentage (0-100)
 */
export type Percentage = Range<0 | 100>;

/**
 * Skill level (0-100)
 */
export type SkillLevel = Range<0 | 100>;

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Game constants
 */
export const CONSTANTS = {
  // Skill bounds
  MIN_SKILL: 0,
  MAX_SKILL: 100,

  // Mental state bounds
  MIN_MENTAL_STATE: 0,
  MAX_MENTAL_STATE: 100,

  // Car state bounds
  MIN_TIRE_WEAR: 0,
  MAX_TIRE_WEAR: 100,
  MIN_FUEL: 0,
  MAX_FUEL: 100,

  // NASCAR specs
  NASCAR_HORSEPOWER: 750,
  NASCAR_WEIGHT: 3400,
  NASCAR_DRAG_COEFFICIENT: 0.32,
  NASCAR_FUEL_CAPACITY: 18,

  // Physics constants
  DRAFT_ZONE_LENGTH: 2.0,     // Car lengths
  DRAFT_SPEED_BOOST: 4.0,     // MPH
  DRAFT_FUEL_SAVINGS: 0.10,   // 10% reduction

  // Tire wear
  TIRE_WEAR_BASE_RATE: 1.0,   // % per lap baseline

  // Fuel consumption (gallons per lap by track type)
  FUEL_BASE_SUPERSPEEDWAY: 0.27,
  FUEL_BASE_INTERMEDIATE: 0.20,
  FUEL_BASE_SHORT: 0.11,
  FUEL_BASE_ROAD: 0.18,

  // Fuel weight penalty (seconds per gallon by track type)
  FUEL_WEIGHT_PENALTY_SUPERSPEEDWAY: 0.025,
  FUEL_WEIGHT_PENALTY_INTERMEDIATE: 0.045,
  FUEL_WEIGHT_PENALTY_SHORT: 0.055,
  FUEL_WEIGHT_PENALTY_ROAD: 0.040,

  // Fuel efficiency modifiers
  FUEL_SKILL_MAX_BONUS: 0.12,      // 12% max reduction from consistency
  FUEL_CONFIDENCE_MAX_BONUS: 0.08, // 8% max reduction from confidence
  FUEL_FRUSTRATION_MAX_PENALTY: 0.20, // 20% max increase from frustration

  // Decision timing
  ROUTINE_DECISION_TIME: 12,  // Seconds
  TACTICAL_DECISION_TIME: 6,  // Seconds
  EMERGENCY_DECISION_TIME: 3, // Seconds
} as const;

// All types are already exported via 'export interface' and 'export type' declarations above

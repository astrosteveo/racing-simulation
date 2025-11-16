# Game Design Specification - NASCAR RPG Racing Simulation

## Core Concept

An RPG-style NASCAR racing simulation where player skill is represented through character stats that evolve over time. Unlike traditional racing games that rely on expensive peripherals and manual dexterity, this game simulates the mental and strategic aspects of racing through:

- **Character progression** - Driver skills improve through experience
- **Mental state system** - Confidence, frustration, and focus affect performance dynamically
- **Strategic decisions** - Time-pressured choices that impact race outcomes
- **Real physics simulation** - Outcomes calculated from NASCAR racing mechanics, not predetermined

## Game Loop

### Career Mode Flow

1. **Pre-Race**
   - Select track
   - Review car setup
   - Check driver stats and current form
   - Set race strategy (fuel, tire plan)

2. **Race Simulation**
   - Race progresses in real-time or accelerated time
   - Player presented with timed decisions at key moments
   - Driver stats + mental state + decisions determine performance
   - Physics engine calculates positions, lap times, tire wear, fuel consumption

3. **Post-Race**
   - Results screen
   - XP awarded based on performance
   - Skill progression
   - Unlock next race/track
   - Career stats updated

### Single Race Flow

1. Configure driver (set skill levels or use preset)
2. Select track
3. Race simulation with decisions
4. Results and analysis

## RPG Systems

### Character Stats

The driver has persistent stats that improve through XP/progression:

#### Core Skills (0-100 scale)

**Racecraft** - Overall racing ability
- Affects: Base lap time, overtaking success, accident avoidance
- Progression: Increases with race experience

**Consistency** - Ability to maintain pace
- Affects: Lap time variance, tire preservation, fuel efficiency
- Progression: Increases with clean laps, decreases with mistakes

**Aggression** - Willingness to take risks
- Affects: Overtaking opportunities, tire wear rate, accident risk
- Progression: Modified by player decisions (risky vs safe choices)

**Focus** - Mental sharpness and concentration
- Affects: Decision quality, mistake frequency, stamina drain
- Progression: Decreases during long races, improves with experience

**Stamina** - Physical endurance
- Affects: Performance degradation over race distance, focus retention
- Progression: Improves slowly with race experience

**Composure** - Emotional control under pressure
- Affects: Mental state recovery rate, decision making under stress
- Progression: Improves with experience, decreases with repeated failures

#### Specialized Skills (0-100 scale)

**Draft Sense** - Reading aerodynamic situations
- Affects: Efficiency of drafting, slingshot timing
- Progression: Improves with successful drafting maneuvers

**Tire Management** - Preserving tire life
- Affects: Tire degradation rate, grip retention
- Progression: Improves with conservative driving, pit strategy execution

**Fuel Management** - Efficient fuel usage
- Affects: Fuel consumption rate, ability to stretch fuel runs
- Progression: Improves with fuel-saving decisions

**Pit Strategy** - Understanding when to pit
- Affects: Quality of pit timing decisions
- Progression: Improves with successful pit calls

### XP and Progression

**XP Sources:**
- Race completion: Base XP (varies by track difficulty)
- Position finish: Bonus for top 10/5/3/1
- Clean laps: Bonus for laps without incidents
- Successful passes: XP per position gained
- Successful decisions: XP for good strategic choices
- Mental state management: Bonus for maintaining composure

**Skill Advancement:**
- Each skill levels up independently
- XP requirements increase per level (exponential curve)
- Skill caps at 100 (mastery)
- Early levels come quickly, later levels require significant racing

**Progression Example:**
```
Race 1: Rookie driver (all skills 30-40)
→ Finish 15th, some clean laps
→ +50 XP to Racecraft, +30 to Consistency

Race 10: Developing driver (skills 45-55)
→ Finish 8th, good tire management
→ +100 XP to Racecraft, +75 to Tire Management

Race 50: Experienced driver (skills 65-75)
→ Win, masterful performance
→ +200 XP distributed across skills
```

### Mental State System

**Dynamic attributes that change during each race:**

#### Confidence (0-100)
- **Starts:** Based on recent performance and skill level
- **Increases:** Successful passes, fast laps, good decisions, leading race
- **Decreases:** Being passed, mistakes, crashes, falling behind
- **Effects:**
  - High (80+): +5% lap time improvement, better decision options
  - Medium (40-79): Normal performance
  - Low (0-39): -5% lap time penalty, higher mistake chance

#### Frustration (0-100)
- **Starts:** Low (0-20)
- **Increases:** Repeated failed passes, getting stuck in traffic, bad luck events, poor decisions
- **Decreases:** Successful maneuvers, time, good decisions
- **Effects:**
  - Low (0-30): Normal performance
  - Medium (31-60): -3% to Consistency and Focus
  - High (61-100): -10% to Consistency, -5% to Focus, risky decision bias

#### Focus (0-100)
- **Starts:** Based on driver Stamina and Focus skills
- **Increases:** Rest (under caution), good mental state
- **Decreases:** Race duration, high frustration, mistakes, close battles
- **Effects:**
  - High (80+): Normal decision time, low mistake chance
  - Medium (40-79): Normal performance
  - Low (0-39): Reduced decision time, +20% mistake chance

#### Distraction (0-100)
- **Starts:** Low (0-10)
- **Increases:** Outside events, frustration spillover, sustained focus drain
- **Decreases:** Time, clean racing, confidence gains
- **Effects:**
  - Low (0-30): Normal performance
  - Medium (31-60): -2% lap time, slower reactions
  - High (61-100): -5% lap time, decision penalties, high mistake risk

### Mental State Interactions

**Positive Feedback Loop (Success):**
```
Good pass → +Confidence → Better performance → More good passes → Higher confidence
```

**Negative Feedback Loop (Struggle):**
```
Failed pass → +Frustration → Worse performance → More failed passes → Higher frustration
```

**Recovery Mechanics:**
- Caution periods: Reset focus, reduce frustration
- Successful decision: Boost confidence, reduce distraction
- Clean laps: Gradually reduce frustration
- High Composure skill: Faster mental state recovery

## Physics Simulation

### Core Physics Systems

All race outcomes are CALCULATED from these physics models:

#### 1. Vehicle Dynamics

**Speed Calculation:**
```
max_speed = f(horsepower, drag_coefficient, weight, altitude)
corner_speed = f(banking, radius, tire_grip, downforce, driver_skill)
acceleration = f(horsepower, weight, tire_grip, driver_skill)
```

**Tire Physics:**
- Grip level: 100% (fresh) → 50% (worn out)
- Degradation rate: f(aggression, track_surface, temperature, compound)
- Effect on performance:
  - Corner speed: Linear reduction with wear
  - Acceleration: Affected below 70% grip
  - Braking: Affected below 80% grip

**Fuel System:**
- Tank capacity: ~18 gallons (NASCAR spec)
- Consumption rate: f(throttle_position, draft_status, track_type)
- Weight effect: -0.03s per lap per gallon (fuel weight impacts speed)
- Empty tank warning: Last 5 laps worth of fuel

#### 2. Aerodynamics

**Drafting:**
- Draft zone: 2-3 car lengths behind leader
- Speed boost: +3-5 mph in draft zone
- Fuel saving: -10% consumption in draft
- Distance calculation: Updated per track section

**Side-by-Side Racing:**
- Reduced aerodynamic efficiency: -2% speed for both cars
- Increased tire wear: +10% for both cars
- Affects corner entry and exit speeds

**Clean Air:**
- Full aerodynamic efficiency
- Normal tire wear
- Base speed calculations apply

#### 3. Track Physics

**Banking:**
```
corner_speed = base_speed * (1 + banking_angle / 45°)
```
Higher banking allows higher corner speeds.

**Track Surface:**
- Grip multiplier: 0.8 (old surface) → 1.0 (new surface)
- Affects tire wear rate and corner speeds
- Can vary by track section

**Track Length:**
- Determines lap count for race distance
- Affects fuel and tire strategy windows

#### 4. Lap Time Calculation

Each lap is broken into track sections:

```typescript
for each section in track:
  entry_speed = calculate_entry_speed(prior_section, current_section, tire_grip, fuel_weight)

  if (section.type === 'turn'):
    section_speed = corner_speed(banking, radius, tire_grip, driver_skill, confidence)
  else:
    section_speed = straight_speed(horsepower, draft_status, fuel_weight)

  section_time = section_length / section_speed
  lap_time += section_time
```

**Driver Skill Modifiers:**
- Racecraft: ±2% lap time
- Consistency: Affects lap-to-lap variance (±0.5s to ±0.1s)
- Tire Management: Affects degradation rate

**Mental State Modifiers:**
- Confidence: ±5% lap time
- Frustration: Up to -5% lap time
- Focus: Affects mistake probability
- Distraction: -5% lap time at high levels

#### 5. Passing Mechanics

**Overtake Probability:**
```
pass_chance = base_probability *
              (attacker_skill / defender_skill) *
              (attacker_speed / defender_speed) *
              confidence_modifier *
              (1 - frustration_penalty)
```

**Factors:**
- Speed differential (draft, tire condition, mental state)
- Driver skill (Racecraft, Aggression)
- Track section (straights easier than corners)
- Mental state (confidence increases chance, frustration decreases)

**Outcomes:**
- Success: Position swap, +confidence, -frustration
- Failure (no opening): No position change, +frustration
- Failure (contact/spin): Positions lost, damage, mental state penalties

## Decision System

### Decision Framework

**Characteristics:**
- **Time-limited:** Player has limited real-world seconds to choose
- **Context-aware:** Options based on race situation, skills, mental state
- **Consequences:** Choices affect race outcome and mental state
- **Default option:** Conservative choice selected if timer expires

### Decision Types

#### 1. Pit Strategy Decisions

**"Do you want to pit this lap?"**
- **Context:** Caution flag, fuel/tire window, race position
- **Options:**
  - Pit now (gain track position if others don't, fresh tires/fuel)
  - Stay out (maintain position if others pit, save time)
  - Splash and go (fuel only, faster stop)
- **Factors affecting outcome:**
  - Pit Strategy skill level
  - Fuel remaining vs laps to go
  - Tire condition vs race pace
  - Position on track
- **Default:** Pit if fuel < 20% or tires < 40%

#### 2. Passing Opportunities

**"Car ahead is slow in turn 2. Attempt pass?"**
- **Context:** Speed differential, track section, gap
- **Options:**
  - Aggressive pass (high risk, high reward)
  - Patient approach (wait for better opportunity)
  - Stay behind and draft (safe, builds opportunity)
- **Factors:**
  - Racecraft and Aggression skills
  - Tire grip differential
  - Mental state (confidence enables risk, frustration biases aggression)
- **Default:** Patient approach

#### 3. Traffic Management

**"Lapped car ahead blocking your line. How to handle?"**
- **Options:**
  - Aggressive move (quick but risky)
  - Signal and wait (safer, loses time)
  - Find alternate line (moderate risk/reward)
- **Factors:**
  - Racecraft skill
  - Current mental state
  - Championship implications
- **Default:** Signal and wait

#### 4. Incident Response

**"Car spun ahead! Which line?"**
- **Context:** Accident developing, split-second choice
- **Options:**
  - High line (avoids smoke, possible debris)
  - Low line (shorter distance, possible contact)
  - Brake hard (safest, lose positions)
- **Factors:**
  - Focus level (low focus = reduced decision time)
  - Reflexes (derived from driver skills)
- **Default:** Brake hard

#### 5. Tire Management

**"Tires at 60%, 50 laps remain. Adjust driving?"**
- **Options:**
  - Push hard (maintain pace, faster wear)
  - Conserve tires (slower pace, preserve grip)
  - Balanced approach (moderate pace/wear)
- **Factors:**
  - Tire Management skill
  - Track position
  - Fuel strategy
- **Default:** Balanced approach

#### 6. Mental State Management

**"Frustration building after 3 failed passes. Response?"**
- **Options:**
  - Take a breath, refocus (reduces frustration, may lose positions)
  - Keep pushing (maintain position, frustration continues)
  - Get aggressive (risk/reward, could succeed or make it worse)
- **Factors:**
  - Composure skill
  - Current mental state
  - Race importance
- **Default:** Take a breath

### Decision Timing

**Decision frequency:** ~1-3 decisions per 10 laps (varies by race situation)

**Time limits:**
- Routine decisions (pit strategy): 10-15 seconds
- Tactical decisions (passing): 5-8 seconds
- Emergency decisions (incidents): 2-4 seconds
- Mental state decisions: 8-12 seconds

**Reduced time under stress:**
- Low focus: -30% decision time
- High frustration: -20% decision time
- High distraction: -25% decision time

## Track System

### Track Properties

Each track is defined by:

```typescript
interface Track {
  name: string;              // "Bristol Motor Speedway"
  nickname?: string;         // "The Last Great Colosseum"
  length: number;            // Miles (0.533 for Bristol)
  type: TrackType;          // 'short' | 'intermediate' | 'superspeedway' | 'road'
  banking: {
    turns: number;           // Degrees (26 for Bristol)
    straights: number;       // Degrees
  };
  surface: SurfaceType;      // 'concrete' | 'asphalt'
  surfaceGrip: number;       // 0.8-1.0 multiplier
  sections: TrackSection[];  // Array of turns and straights
  difficulty: number;        // 1-10 rating
  raceLaps: number;          // Standard race distance in laps
}
```

### Initial Track Roster

**Start with 2-3 simplified tracks covering different types:**

1. **Short Track** (Bristol-style)
   - Length: ~0.5 miles
   - High banking (24-28°)
   - Tight, intense racing
   - High tire wear

2. **Intermediate** (Charlotte-style)
   - Length: ~1.5 miles
   - Medium banking (20-24°)
   - Balanced strategy
   - Moderate tire/fuel consumption

3. **Superspeedway** (Daytona-style)
   - Length: ~2.5 miles
   - Varied banking (18-31°)
   - Drafting critical
   - Fuel strategy important

### Track Sections

Tracks are divided into sections for detailed simulation:

```typescript
interface TrackSection {
  type: 'straight' | 'turn';
  length: number;          // Feet or meters
  banking?: number;        // Degrees (for turns)
  radius?: number;         // Feet (for turns)
  idealLine: number;       // Speed in MPH
  surfaceGrip: number;     // 0.8-1.0 (can vary from track baseline)
}
```

## Car System

### Car Properties

All cars have equal specifications (NASCAR spec racing):

```typescript
interface Car {
  horsepower: number;       // ~750 HP (NASCAR Cup spec)
  weight: number;           // ~3400 lbs
  dragCoefficient: number;  // ~0.32
  downforce: number;        // Aerodynamic downforce value
  tireCompound: string;     // Currently equipped tire type
  fuelCapacity: number;     // ~18 gallons
}
```

**Initially:** All cars are identical. Focus on driver skill differentiation.

**Future:** Could add car setup variations (downforce, gear ratios) as a strategic layer.

## AI Competitors

### AI Driver System

AI drivers are essentially NPCs with:
- **Name and number** (can be fictional or real NASCAR drivers)
- **Skill ratings** (same attributes as player)
- **Personality traits** (affects decision-making)
  - Aggressive vs Conservative
  - Risky vs Safe
  - Adaptive vs Stubborn
- **Mental state** (simulated same as player)

### AI Behavior

**Decision making:**
- AI drivers make same types of decisions as player
- Decisions based on their skills and personality
- Mental state affects AI performance too (creates dynamic racing)

**Difficulty levels:**
- **Rookie:** AI skills 40-50
- **Amateur:** AI skills 50-65
- **Professional:** AI skills 65-80
- **Elite:** AI skills 80-95

**Field composition:**
- Mix of skill levels in each race
- Player starts mid-pack initially
- Works up to racing against elite drivers

## Race Types and Game Modes

### Single Race

- Select track
- Configure driver (or use career driver)
- Compete against AI field
- No progression, just practice/fun

### Career Mode

**Structure:**
- Start as rookie driver (skills 30-40)
- Progress through season(s)
- Unlock tracks as you advance
- Build reputation and skills
- Aim for championship

**Season Structure (Initial - Simple):**
- 10-race season
- Points awarded per finish (NASCAR-style)
- Championship winner = most points

**Future Expansion:**
- Multi-season careers
- Team management
- Sponsorships
- Contract negotiations

### Time Trial

- Solo runs for best lap time
- No tire wear / fuel consumption
- Pure skill test
- Leaderboards (local)

## Win Conditions and Objectives

### Race Win Conditions

**Primary:** Finish with best cumulative time / highest position

**Failure states:**
- Mechanical failure (future feature)
- Run out of fuel
- Too much damage to continue
- Disqualification (rule violations - future)

### Career Objectives

**Short-term:**
- Finish in top 10/5/3
- Complete race without incidents
- Execute successful strategy calls
- Build specific skills

**Long-term:**
- Win races
- Win championship
- Max out all skills
- Beat elite AI drivers

### Challenges (Future)

- "Maintain composure under pressure" (keep frustration low while running top 5)
- "Tire whisperer" (Win race with 1 less pit stop than field)
- "Comeback kid" (Win from 20th+ starting position)

## Progression and Unlocks

### Track Unlocks

- **Start:** 1-2 tracks available
- **Unlock:** Finish top 10 in previous track
- **Milestone unlocks:** Win at certain tracks to unlock special tracks

### Driver Advancement

- XP earned each race
- Skills level up independently
- Visual indicators of skill progression
- Milestones celebrated (first win, first championship, max skill)

### Future Unlocks

- Car liveries/schemes
- Historical tracks
- Legendary AI drivers
- Special challenge races

## User Interface (Console Version)

### Race Display

```
Lap 45 / 500 | Position: 8th / 40 | Laps Led: 0
Fuel: 42% | Tires: 68% | Gap to Leader: -8.4s

Confidence: ████████░░ 80% | Frustration: ██░░░░░░░░ 20%
Focus: ██████░░░░ 60%      | Distraction: █░░░░░░░░░ 10%

Racecraft: 72  | Consistency: 68  | Aggression: 55
Focus: 64      | Stamina: 58       | Composure: 61

Last Lap: 15.423s | Best Lap: 15.201s | Leader Lap: 15.189s

[Lap times graph - simple ASCII]
[Position chart - simple ASCII]

DECISION REQUIRED (8 seconds):
Caution flag! Do you pit?
1. Pit now (4 tires + fuel)
2. Stay out (maintain track position)
3. Fuel only (quick stop)
> _
```

### Post-Race Screen

```
RACE RESULTS - Bristol Motor Speedway

Finish Position: 8th / 40
Laps Led: 12
Best Lap: 15.201s
Avg Lap: 15.487s

XP EARNED:
+150 Racecraft
+100 Consistency
+75 Tire Management
+50 Composure

RACE STATS:
Positions Gained: +7 (started 15th)
Clean Laps: 423 / 500
Successful Passes: 18
Failed Passes: 4
Decisions Made: 12 (10 good, 2 poor)

Next Race: Charlotte Motor Speedway (Unlocked!)
```

### Menu System

```
NASCAR RPG RACING SIMULATION

[C] Career Mode
[S] Single Race
[T] Time Trial
[D] Driver Stats
[O] Options
[Q] Quit

> _
```

## Technical Considerations

### Performance Requirements

- Simulate full race in reasonable time (seconds to minutes, not hours)
- Support accelerated time (10x, 50x, 100x speed)
- Pause / resume capability
- Save / load race state

### Data Storage

**Career Save Data:**
- Driver stats and progression
- Unlocked tracks
- Race history
- Current season standings

**Race State (for pause/resume):**
- Current lap, positions
- Tire wear, fuel levels
- Mental states
- Decision history

### Simulation Accuracy vs Performance

**Balance:**
- Detailed enough to feel realistic
- Fast enough to simulate 500-lap races quickly
- Sections vs continuous: Use section-based calculation for performance

**Accuracy priorities:**
1. Tire wear impact - Critical
2. Fuel strategy - Critical
3. Mental state effects - Critical
4. Drafting - Important
5. Weather (future) - Nice to have

## Future Features (Post-MVP)

### Near-term

- Weather system (rain, temperature effects)
- Mechanical failures (engine, tires, suspension)
- More detailed pit stops (crew skill, mistakes)
- Visual race viewer (2D top-down animation)

### Mid-term

- Full NASCAR schedule (36+ races)
- Real driver names and stats
- Team management (hire crew)
- Multiplayer (async or real-time)

### Long-term

- 3D visualization / game client
- VR support
- Historical seasons
- Create-a-driver deeper customization
- Esports/competitive mode

## Success Metrics

The game is successful if:

1. **Core loop is engaging:** Players want to race again after finish
2. **Progression feels rewarding:** Skill improvements are noticeable
3. **Decisions matter:** Player choices impact outcomes
4. **Mental state creates drama:** Emotional dynamics add depth
5. **Physics feel realistic:** Outcomes make sense, not random
6. **Replayability:** Different strategies and approaches work

## Design Pillars

1. **Simulation over arcade:** Real calculations, not fake numbers
2. **Strategy over reflexes:** Thinking beats button-mashing
3. **Progression over perfection:** Growth and improvement over time
4. **Accessibility:** No expensive hardware required
5. **Depth:** Easy to learn, hard to master

---

This spec serves as the source of truth for game design. Refer back to this document when making implementation decisions or considering new features.

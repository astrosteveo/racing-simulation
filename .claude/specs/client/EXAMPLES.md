# 3D Client Examples & User Flows

**Last Updated:** 2025-11-16

## Example 1: Race Start Sequence

```
1. Player selects "Start Race" from menu
2. Loading screen: "Loading Bristol Motor Speedway..."
3. 3D track renders, 40 cars on starting grid
4. HUD appears: P15 / 40, Lap 1 / 100
5. Camera defaults to chase cam behind player car
6. "GREEN FLAG!" - race begins
7. Cars accelerate, player watches from chase cam
```

## Example 2: Passing Decision Emergence

```
Race Situation:
- Lap 25/100
- Player P8, car #42 ahead in P7
- Gap: 0.2s (close!)
- Just had good exit from Turn 2
- Straight ahead
- Player's racecraft: 68, aggression: 72

Engine Decision Logic:
✓ Gap < 0.3s
✓ Straight section
✓ Racecraft > 65
✓ Aggression > 50
→ Trigger "passing" decision

Client Behavior:
1. Race slows to 50% speed
2. Decision overlay appears:
   "You've got a run on #42! Go for it?"
   ⏱ 10 seconds to decide
   
   [A] Look inside (High risk/reward, needs Aggression 70+)
   [B] Use draft and wait (Safe, moderate reward)
   [C] Try outside line (Medium risk)
   
3. Player presses "A" or clicks option
4. Overlay closes, race resumes full speed
5. Engine calculates outcome based on racecraft + aggression
6. Visual feedback: If successful, car moves to P7, HUD updates
```

## Example 3: Multi-Camera Racing

```
Lap 45, Player in P5, battling for P4:

Cockpit View:
- First-person from driver seat
- Dashboard visible (speed: 142 MPH)
- Limited visibility
- HUD: Tire 65%, Fuel 45%, P5/40
- Can see car #18 ahead through windshield

[Player presses C to switch camera]

Chase Cam:
- Third-person view, 20 feet behind car
- Can see #18 ahead and #22 behind
- Wider track visibility
- Better for situational awareness

[Player presses C again]

TV/Broadcast Cam:
- Trackside camera angle
- Cinematic view of battle for P4
- Can see multiple cars in frame
- Good for understanding pack dynamics

[Player presses C again - back to cockpit]
```

## Example 4: Mental State Impact

```
Situation: Stuck behind slow car for 15 laps

Visual Cues:
- HUD shows frustration: 78% (red zone)
- Screen edge has subtle red tint
- Decision prompt appears more frequently

Decision Prompt:
"You're getting frustrated behind #33. Leaders pulling away!"

Options depend on mental state:
- High composure (70+): "Stay calm, opportunity will come"
- Low composure (<60): Option appears: "Force the issue aggressively"

Player chooses aggressive option:
- Success: Pass for position, frustration drops to 45%
- Failure: Contact, damage, frustration spikes to 90%

Visual Outcome:
- If success: Position change animation, HUD updates
- If failure: Car wobbles, damage indicator appears
```

## Example 5: Tire/Fuel Management

```
Lap 60/100, Tire 40%, Fuel 35%

HUD Warning:
- Tire gauge turns yellow
- Fuel gauge turns orange
- "Pit window opening" notification

Lap 65 - Decision Prompt:
"Pit strategy time. What's the call?"

[A] Pit now - full service (lose 4 positions, fresh tires+fuel)
[B] Stay out 10 more laps (gamble on caution, stretch fuel)
[C] Fuel only - quick stop (2 positions, conserve old tires)

Visual During Pit:
- Car enters pit lane (animated)
- Pit crew visualization (simple)
- Timer: 14.2s
- Re-enters track in P12 (was P8)

Post-Pit HUD:
- Tire: 100% (green)
- Fuel: 100% (green)
- Fresh tires = better grip = faster laps
```

## Example 6: Career Mode Progression

```
Race End - Bristol, Finished P3

Results Screen:
┌─────────────────────────────────────┐
│   RACE RESULTS                      │
│   Bristol Motor Speedway            │
│                                     │
│   Finish: P3 (+7 positions)         │
│   Start: P10                        │
│   Laps Led: 12                      │
│   Fastest Lap: 15.2s                │
│                                     │
│   CHAMPIONSHIP POINTS               │
│   Position: +34 pts                 │
│   Led a Lap: +5 pts                 │
│   TOTAL: +39 pts                    │
│                                     │
│   SKILL GAINS                       │
│   Racecraft: +0.8 (68.2 → 69.0)    │
│   Composure: +0.5 (64.1 → 64.6)    │
│   Aggression: +0.3 (72.0 → 72.3)   │
│                                     │
│   🔓 NEW TRACK UNLOCKED!            │
│   Richmond Raceway                  │
│                                     │
│   [Continue to Season]              │
└─────────────────────────────────────┘
```

## UI Mockup Concepts

### HUD Layout (Chase Cam)

```
┌──────────────────────────────────────────────┐
│  P8 / 40    Lap 45 / 100    Gap: +3.2s      │  Top bar
├──────────────────────────────────────────────┤
│                                              │
│              [3D RACING VIEW]                │
│                                              │
│              Cars moving around track        │
│                                              │
│                                              │
│  🔴●●●●  65%    ▓▓▓▓░░░  45%               │  Bottom left
│  TIRE           FUEL                         │
│                                              │
│  Last: 15.8s  Best: 15.2s                   │  Bottom right
└──────────────────────────────────────────────┘
```

### Decision Prompt Overlay

```
┌──────────────────────────────────────────────┐
│              [Race in background]            │
│     ┌──────────────────────────────┐         │
│     │  ⏱ 8 seconds                 │         │
│     │                              │         │
│     │  You've got a run on #42!    │         │
│     │  Go for it?                  │         │
│     │                              │         │
│     │  [A] Look inside             │         │
│     │      High risk/reward        │         │
│     │      Needs: Aggression 70+   │         │
│     │                              │         │
│     │  [B] Use draft and wait      │         │
│     │      Safe, moderate reward   │         │
│     │                              │         │
│     │  [C] Try outside line        │         │
│     │      Medium risk             │         │
│     └──────────────────────────────┘         │
└──────────────────────────────────────────────┘
```

---

**Note:** These are conceptual examples. Actual implementation will evolve during development.

# User Interface Screen Layouts

**Version:** 1.0
**Last Updated:** 2025-11-16

---

## Overview

Detailed screen layout specifications for all console UI displays. This document provides pixel-perfect mockups with column measurements, spacing, and component placement.

**Terminal Constraints:**
- Minimum: 80 columns × 24 rows
- Recommended: 100 columns × 30 rows
- All measurements in character columns

---

## LiveRaceDisplay Layout

### Full Screen Layout (100 columns × 30 rows)

```
Column:  0         10        20        30        40        50        60        70        80        90        100
         |         |         |         |         |         |         |         |         |         |
Row  1:  ════════════════════════════════════════════════════════════════════════════════════════════════════
Row  2:                              BRISTOL MOTOR SPEEDWAY
Row  3:                                  Lap 45 / 500
Row  4:  ════════════════════════════════════════════════════════════════════════════════════════════════════
Row  5:
Row  6:  LEADER: #3 Dale Earnhardt      Last Lap: 15.412s
Row  7:
Row  8:  YOUR STATUS:
Row  9:  Position: P5 (+2 from start)
Row 10:  Gap to Leader: +1.24s  |  Gap Ahead: +0.31s
Row 11:
Row 12:  Lap Progress: [=========================>...............]  62%
Row 13:
Row 14:  STANDINGS:
Row 15:  Pos | Car# | Driver              | Last Lap  | Gap
Row 16:  ----+------+---------------------+-----------+--------
Row 17:   1  | #3   | Dale Earnhardt      |  15.412s  | Leader
Row 18:   2  | #24  | Jeff Gordon         |  15.438s  | +0.15s
Row 19:   3  | #48  | Jimmie Johnson      |  15.501s  | +0.67s
Row 20:   4  | #88  | Dale Earnhardt Jr.  |  15.521s  | +0.93s
Row 21:   5  | #42  | YOU                 |  15.543s  | +1.24s  ← Highlighted
Row 22:   6  | #11  | Denny Hamlin        |  15.567s  | +1.58s
Row 23:   7  | #18  | Kyle Busch          |  15.589s  | +1.89s
Row 24:   8  | #22  | Joey Logano         |  15.612s  | +2.23s
Row 25:   9  | #4   | Kevin Harvick       |  15.634s  | +2.58s
Row 26:  10  | #19  | Carl Edwards        |  15.657s  | +2.94s
Row 27:
Row 28:  CAR STATUS:
Row 29:  Tires: ████████████░░░░ 75%  (17 laps since pit)
Row 30:  Fuel:  ██████████████░░ 88%
(continues below if terminal allows)
```

---

### Component Breakdown

#### Header Section (Rows 1-4)

```
════════════════════════════════════════════════════════════
                    TRACK NAME HERE
                    Lap X / Y
════════════════════════════════════════════════════════════
```

**Specifications:**
- Row 1: Full-width separator (═ characters)
- Row 2: Track name, centered, uppercase
- Row 3: Lap counter, centered, format: "Lap {current} / {total}"
- Row 4: Full-width separator

**Column Alignment:**
- Track name: Center-aligned (column 50 ± name length)
- Lap counter: Center-aligned

---

#### Leader Info (Row 6)

```
LEADER: #3 Dale Earnhardt      Last Lap: 15.412s
```

**Specifications:**
- Column 0-6: "LEADER:"
- Column 8-30: Car number and driver name
- Column 45-60: "Last Lap: {time}"

**Format:**
- Car number: `#` + number
- Driver name: Up to 20 characters
- Lap time: Formatted via `formatLapTime()`

---

#### Player Status (Rows 8-12)

```
YOUR STATUS:
Position: P5 (+2 from start)
Gap to Leader: +1.24s  |  Gap Ahead: +0.31s

Lap Progress: [=========================>...............]  62%
```

**Specifications:**

**Row 8:** Section header
- "YOUR STATUS:" at column 0

**Row 9:** Position
- Column 0-9: "Position:"
- Column 11-16: "P{pos}"
- Column 18+: "(±{delta} from start)"

**Row 10:** Gaps
- Column 0-14: "Gap to Leader:"
- Column 16-23: Formatted gap
- Column 25-27: " | "
- Column 28-38: "Gap Ahead:"
- Column 40+: Formatted gap

**Row 12:** Lap Progress Bar
- Column 0-13: "Lap Progress:"
- Column 15-55: Progress bar (40 chars wide)
- Column 57+: Percentage

---

#### Standings Table (Rows 14-26)

```
STANDINGS:
Pos | Car# | Driver              | Last Lap  | Gap
----+------+---------------------+-----------+--------
 1  | #3   | Dale Earnhardt      |  15.412s  | Leader
...
```

**Column Layout:**

| Column Range | Field | Width | Alignment |
|--------------|-------|-------|-----------|
| 0-3 | Position | 4 | Right |
| 4 | Separator | 1 | - |
| 5-10 | Car Number | 6 | Center |
| 11 | Separator | 1 | - |
| 12-32 | Driver Name | 21 | Left |
| 33 | Separator | 1 | - |
| 34-43 | Last Lap | 10 | Right |
| 44 | Separator | 1 | - |
| 45-52 | Gap | 8 | Right |

**Header:**
- Row 14: "STANDINGS:" at column 0
- Row 15: Column headers
- Row 16: Separator row (dashes and plus signs)

**Data Rows:**
- Rows 17-26: Top 10 positions
- Player row highlighted (visual indicator if colors enabled)

---

#### Car Status (Rows 28-30)

```
CAR STATUS:
Tires: ████████████░░░░ 75%  (17 laps since pit)
Fuel:  ██████████████░░ 88%
```

**Specifications:**

**Row 28:** Section header
- "CAR STATUS:" at column 0

**Row 29:** Tire Wear
- Column 0-6: "Tires:"
- Column 8-23: Progress bar (16 chars)
- Column 25-28: Percentage
- Column 30+: "(X laps since pit)"

**Row 30:** Fuel Level
- Column 0-6: "Fuel: "
- Column 8-23: Progress bar (16 chars)
- Column 25-28: Percentage

**Progress Bar Format:**
- Width: 16 characters
- Filled: `█` (U+2588)
- Empty: `░` (U+2591)

---

#### Mental State (Rows 32-34, if space allows)

```
MENTAL STATE:
Confidence: ████████████████ 82%  ↑
Focus:      ██████████████░░ 78%  ↓
Frustration: ████░░░░░░░░░░░ 23%  →
```

**Specifications:**

**Row 32:** Section header
- "MENTAL STATE:" at column 0

**Rows 33-35:** Mental state bars
- Column 0-11: State name (right-padded)
- Column 13-28: Progress bar (16 chars)
- Column 30-33: Percentage
- Column 35: Trend arrow (↑ ↓ →)

---

## RaceResultsDisplay Layout

### Full Screen Layout (100 columns × 30 rows)

```
Row  1:  ════════════════════════════════════════════════════════════════════════════════════════════════════
Row  2:                                    RACE RESULTS
Row  3:                          Bristol Motor Speedway - 500 Laps
Row  4:  ════════════════════════════════════════════════════════════════════════════════════════════════════
Row  5:
Row  6:  FINISHING POSITION: 5th  (+2 from start)
Row  7:
Row  8:  RACE STATS:
Row  9:  Started:      P7
Row 10:  Finished:     P5
Row 11:  Laps Led:     12
Row 12:  Fastest Lap:  15.287s (Lap 156)
Row 13:  Average Lap:  15.512s
Row 14:  Clean Laps:   487 / 500  (97.4%)
Row 15:
Row 16:  XP GAINED:
Row 17:  Racecraft:      +125 ████████████░░░░  (Good positioning)
Row 18:  Consistency:    +89  ████████░░░░░░░░  (Clean driving)
Row 19:  Focus:          +67  ██████░░░░░░░░░░  (Maintained concentration)
Row 20:  Tire Mgmt:      +45  ████░░░░░░░░░░░░  (Effective tire saving)
Row 21:
Row 22:  TOTAL XP: +326
Row 23:
Row 24:  Performance Rating: B+
Row 25:
Row 26:  ════════════════════════════════════════════════════════════════════════════════════════════════════
Row 27:  Press Enter to continue...
```

---

### Component Breakdown

#### Header (Rows 1-4)

```
════════════════════════════════════════════════════════════
                      RACE RESULTS
                Bristol Motor Speedway - 500 Laps
════════════════════════════════════════════════════════════
```

**Specifications:**
- Row 1: Full-width separator
- Row 2: "RACE RESULTS" centered
- Row 3: Track name and laps, centered
- Row 4: Full-width separator

---

#### Finishing Position (Row 6)

```
FINISHING POSITION: 5th  (+2 from start)
```

**Format:**
- Position: Ordinal (1st, 2nd, 3rd, 4th, etc.)
- Delta: "(±X from start)" in parentheses

---

#### Race Stats (Rows 8-14)

```
RACE STATS:
Started:      P7
Finished:     P5
Laps Led:     12
Fastest Lap:  15.287s (Lap 156)
Average Lap:  15.512s
Clean Laps:   487 / 500  (97.4%)
```

**Column Alignment:**
- Labels: Column 0-13 (left-aligned)
- Values: Column 14+ (left-aligned)

---

#### XP Breakdown (Rows 16-20)

```
XP GAINED:
Racecraft:      +125 ████████████░░░░  (Good positioning)
Consistency:    +89  ████████░░░░░░░░  (Clean driving)
Focus:          +67  ██████░░░░░░░░░░  (Maintained concentration)
Tire Mgmt:      +45  ████░░░░░░░░░░░░  (Effective tire saving)
```

**Column Layout:**

| Column Range | Field | Width | Alignment |
|--------------|-------|-------|-----------|
| 0-15 | Skill Name | 16 | Left |
| 16-20 | XP Amount | 5 | Right |
| 21-36 | Progress Bar | 16 | - |
| 38+ | Reason | Variable | Left |

**Progress Bar:**
- Width: 16 characters
- Scale: 0-200 XP mapped to 0-16 chars
- Format: `████████░░░░░░░░`

---

## DecisionPrompt Layout

### Full Screen Layout (100 columns × 25 rows)

```
Row  1:  ════════════════════════════════════════════════════════════════════════════════════════════════════
Row  2:                                  DECISION REQUIRED
Row  3:  ════════════════════════════════════════════════════════════════════════════════════════════════════
Row  4:  Lap 234 - You're in P3 with 25 laps to go. Your tires are
Row  5:  at 32% and falling off. The leaders pitted 5 laps ago.
Row  6:
Row  7:  Caution flag is out. Do you pit now?
Row  8:
Row  9:   1. Pit now - fresh tires, lose track position
Row 10:      Risk: MEDIUM | Skills: Pit Strategy, Racecraft
Row 11:      Impact: Lose 2-3 positions, gain ~0.5s/lap pace
Row 12:
Row 13:   2. Stay out - maintain track position, hope for caution
Row 14:      Risk: HIGH | Skills: Tire Management, Focus
Row 15:      Impact: Keep P3, risk tire failure, lose ~0.3s/lap
Row 16:
Row 17:   3. Conserve tires - slow down, preserve what's left
Row 18:      Risk: LOW | Skills: Tire Management, Consistency
Row 19:      Impact: Lose ~0.2s/lap, extend tire life ~5 laps
Row 20:
Row 21:  Time remaining: [████████░░] 8 seconds...
Row 22:
Row 23:  Your choice [1-3]: _
```

---

### Component Breakdown

#### Header (Rows 1-3)

```
════════════════════════════════════════════════════════════
                    DECISION REQUIRED
════════════════════════════════════════════════════════════
```

**Specifications:**
- Full-width separators
- "DECISION REQUIRED" centered

---

#### Context (Rows 4-7)

```
Lap 234 - You're in P3 with 25 laps to go. Your tires are
at 32% and falling off. The leaders pitted 5 laps ago.

Caution flag is out. Do you pit now?
```

**Format:**
- Word-wrapped at column 80
- Blank line before question
- Question on separate line

---

#### Options (Rows 9-19)

Each option uses 3-4 rows:

```
 1. Short label - brief description
    Risk: {LEVEL} | Skills: Skill1, Skill2
    Impact: Expected outcome description
```

**Row 1 of option:**
- Column 0-2: Option number with period
- Column 4+: Label and description

**Row 2 of option:**
- Column 4-8: Indent
- "Risk: {LEVEL}"
- " | Skills: {comma-separated}"

**Row 3 of option:**
- Column 4-8: Indent
- "Impact: {description}"

**Spacing:**
- Blank line between options

---

#### Timer (Row 21)

```
Time remaining: [████████░░] 8 seconds...
```

**Specifications:**
- Column 0-15: "Time remaining:"
- Column 17-27: Progress bar (10 chars)
- Column 29+: "{seconds} seconds..."

**Timer Bar:**
- Width: 10 characters
- Updates every second
- Empties as time decreases

---

#### Input Prompt (Row 23)

```
Your choice [1-3]: _
```

**Format:**
- Range based on number of options
- Underscore cursor indicator

---

## Menu Layout

### Main Menu (100 columns × 20 rows)

```
Row  1:  ════════════════════════════════════════════════════════════════════════════════════════════════════
Row  2:                          NASCAR RPG RACING SIMULATION
Row  3:  ════════════════════════════════════════════════════════════════════════════════════════════════════
Row  4:
Row  5:  MAIN MENU:
Row  6:
Row  7:   1. Quick Race
Row  8:      Jump into a single race
Row  9:
Row 10:   2. Career Mode
Row 11:      Season championship with progression
Row 12:
Row 13:   3. Settings
Row 14:      Configure game options
Row 15:
Row 16:   4. Quit
Row 17:
Row 18:  Your choice [1-4]: _
```

---

### Component Breakdown

#### Menu Options

Each option uses 2-3 rows:

```
 1. Option Label
    Optional description
```

**Row 1:**
- Column 0-2: Number with period
- Column 4+: Label

**Row 2 (if description exists):**
- Column 4-8: Indent
- Description text

**Spacing:**
- Blank line between options

---

## Layout Constraints

### Minimum Terminal Size (80×24)

When terminal is smaller, layout adapts:

1. **Reduce standings table:** Show top 5 instead of top 10
2. **Compress spacing:** Remove blank lines
3. **Shorten labels:** Abbreviate where possible
4. **Horizontal scroll:** For very long text (last resort)

**Example Compressed Layout (80 columns):**

```
════════════════════════════════════════════════════════════════════════════════
                          BRISTOL MOTOR SPEEDWAY
                              Lap 45 / 500
════════════════════════════════════════════════════════════════════════════════
LEADER: #3 Dale Earnhardt      Last Lap: 15.412s

YOUR STATUS: P5 (+2)  |  Leader: +1.24s  |  Ahead: +0.31s
Lap Progress: [==============>............]  62%

STANDINGS:
Pos | Car# | Driver              | Last Lap  | Gap
----+------+---------------------+-----------+--------
 1  | #3   | Dale Earnhardt      |  15.412s  | Leader
 2  | #24  | Jeff Gordon         |  15.438s  | +0.15s
 3  | #48  | Jimmie Johnson      |  15.501s  | +0.67s
 4  | #88  | Dale Earnhardt Jr.  |  15.521s  | +0.93s
 5  | #42  | YOU                 |  15.543s  | +1.24s

Tires: ████████░░░░░░░░ 75%  (17 laps)  |  Fuel: ██████████░░ 88%
Conf: ████████░░ 82% ↑  Focus: ███████░░░ 78% ↓  Frust: ██░░░░░░░░ 23% →
```

---

## Responsive Layout Rules

### 100+ columns (Recommended)
- Full layout with all sections
- Top 10 standings
- Detailed spacing
- Full labels

### 80-99 columns (Minimum)
- Compressed layout
- Top 5 standings
- Reduced spacing
- Abbreviated labels where needed

### <80 columns (Unsupported)
- Display warning message
- Recommend resizing terminal
- Attempt to render anyway (may wrap)

---

## Color Scheme (Optional Enhancement)

When ANSI colors supported:

| Element | Color Code | Visual |
|---------|-----------|---------|
| Headers | Bright White | Bold text |
| Player Row | Green/Cyan | Highlight |
| Leader | Yellow | Emphasis |
| Warnings | Red | Critical info |
| Progress Filled | Green | ████ |
| Progress Empty | Gray | ░░░░ |
| Separators | Gray | ════ |

**Fallback:** All elements work without colors

---

## Testing Layouts

### Visual Regression Tests

1. Generate output for each layout
2. Compare against snapshot
3. Verify column alignment
4. Check spacing consistency

### Terminal Size Tests

```typescript
test('renders correctly at 80x24', () => {
  process.stdout.columns = 80;
  process.stdout.rows = 24;
  const output = renderLiveRace(mockState);
  expect(output).toMatchSnapshot();
});

test('renders correctly at 100x30', () => {
  process.stdout.columns = 100;
  process.stdout.rows = 30;
  const output = renderLiveRace(mockState);
  expect(output).toMatchSnapshot();
});
```

---

## Related Documents

- **SPEC.md** - UI system overview
- **CONTRACTS.md** - Interface documentation
- **EXAMPLES.md** - Real data examples
- **REFERENCE.md** - Quick reference guide

---

**Last Updated:** 2025-11-16
**Next Review:** After Phase 7 UI enhancements

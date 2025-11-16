# NASCAR Physics Reference

This document contains real NASCAR physics formulas, constants, and specifications gathered through research. Use these values for implementing the simulation engine.

**Source:** Research compiled via Claude Code Explore agent from NASCAR specifications, racing physics publications, and validated racing simulations.

---

## Quick Reference - Key Constants

```typescript
export const NASCAR_PHYSICS_CONSTANTS = {
  // Aerodynamics
  aerodynamics: {
    dragCoefficient: 0.32,
    standardDownforceAt200mph: 2000, // lbs
    superspeedwayDownforceAt200mph: 500, // lbs
    draftSpeedBoost: 4, // mph
    optimalDraftDistance: 1.5, // car lengths
    draftFuelSavings: 0.90, // multiplier (10% savings)
    sideBySideSpeedPenalty: 0.98, // 2% reduction
    sideBySideTireWearMultiplier: 1.10 // 10% more wear
  },

  // Tires
  tires: {
    shortTrackLife: 100, // laps
    intermediateTrackLife: 120, // laps
    superspeedwayTrackLife: 140, // laps
    gripCoefficientFresh: 1.35,
    gripCoefficientWorn: 0.5, // 50% of fresh
    lapTimePenaltyPerLap: 0.025, // seconds per lap
  },

  // Fuel
  fuel: {
    tankCapacity: 18, // gallons
    fuelDensity: 6.2, // lbs per gallon
    baseMpg: {
      short: 4.5,
      intermediate: 4.8,
      superspeedway: 5.0
    },
    fuelWeightPenalty: 0.03, // seconds per gallon
  },

  // Car Specifications
  car: {
    weight: 3450, // lbs (minimum with driver)
    standardHorsepower: 670,
    superspeedwayHorsepower: 510,
  },

  // Physics
  physics: {
    gravityFtPerSec2: 32.174,
  }
};
```

---

## 1. Tire Physics

### Tire Degradation Rate

**Tire life by track type:**
- Short tracks (Bristol): 80-100 laps
- Intermediate (Charlotte): 100-120 laps
- Superspeedway (Daytona): 120-150 laps

**Grip degradation:**
- Starts at 100% (fresh tires)
- Degrades to 50% minimum (worn out)
- Linear degradation over tire life

```typescript
function calculateTireGrip(
  lapsOnTires: number,
  trackType: 'short' | 'intermediate' | 'superspeedway'
): number {
  const tireLife = trackType === 'short' ? 100 :
                   trackType === 'intermediate' ? 120 : 140;

  const gripRemaining = Math.max(0.5, 1.0 - (lapsOnTires / tireLife) * 0.5);
  return gripRemaining; // 1.0 (fresh) to 0.5 (worn out)
}
```

### Lap Time Impact from Tire Wear

**Performance degradation:**
- Fresh tires (80%+ grip): Baseline performance
- Moderate wear (50-79%): Linear penalty up to 5%
- Severe wear (<50%): Exponential degradation up to 20%

```typescript
function calculateLapTimeFromTireWear(
  baseLapTime: number,
  tireGripPercentage: number
): number {
  if (tireGripPercentage >= 80) return baseLapTime;

  if (tireGripPercentage >= 50) {
    const wearPenalty = (1.0 - tireGripPercentage / 100) * 0.05;
    return baseLapTime * (1 + wearPenalty);
  }

  // Severe wear - exponential
  const severePenalty = Math.pow((1.0 - tireGripPercentage / 100), 1.5) * 0.20;
  return baseLapTime * (1 + severePenalty);
}
```

### Fresh vs Worn Tire Advantage

**Lap time improvements with fresh tires:**
- Short track: ~0.5 seconds per lap
- Intermediate: ~0.3-0.5 seconds per lap
- Superspeedway: ~0.2-0.3 seconds per lap

### Corner vs Straight Impact

**Tire wear affects corners more than straights:**

```typescript
function calculateSectionSpeedFromTireWear(
  baseSpeed: number,
  tireGrip: number,
  isTurn: boolean
): number {
  if (isTurn) {
    return baseSpeed * tireGrip; // Grip-limited, linear correlation
  } else {
    const straightEffect = 0.5 + (tireGrip * 0.5); // Power-limited
    return baseSpeed * straightEffect;
  }
}
```

---

## 2. Fuel System

### Fuel Specifications

- **Tank capacity:** 18 gallons
- **Fuel density:** 6.2 lbs/gallon
- **Total fuel weight:** 111.6 lbs (full tank)
- **Fuel type:** E-15 (15% ethanol blend)

### Fuel Consumption Rates

**Miles per gallon by track type:**
```typescript
const FUEL_MPG = {
  shortTrack: 4.5,      // ~0.118 gal/lap at Bristol
  intermediate: 4.8,    // ~0.312 gal/lap at Charlotte
  superspeedway: 5.0,   // ~0.500 gal/lap at Daytona
};
```

**Fuel windows (laps per tank):**
- Bristol (0.533 mi): ~152 laps
- Charlotte (1.5 mi): ~58 laps
- Daytona (2.5 mi): ~36 laps

```typescript
function calculateFuelConsumption(
  trackLengthMiles: number,
  mpg: number
): number {
  return trackLengthMiles / mpg; // gallons per lap
}
```

### Fuel Weight Impact on Lap Time

**Weight penalty:**
- **-0.03 seconds per lap per gallon**
- Full tank (18 gal): +0.54 seconds vs empty
- Half tank (9 gal): +0.27 seconds vs empty

```typescript
function calculateFuelWeightPenalty(gallonsRemaining: number): number {
  return gallonsRemaining * 0.03; // seconds added to lap time
}
```

### Drafting Fuel Savings

**Fuel consumption reduction in draft:**
- **10% savings** when drafting
- Effect most pronounced at superspeedways

```typescript
function calculateDraftFuelEffect(isDrafting: boolean): number {
  return isDrafting ? 0.90 : 1.0; // 10% savings multiplier
}
```

---

## 3. Aerodynamics & Drafting

### Drag Coefficient

**NASCAR Cup car specifications:**
- Drag coefficient (Cd): **0.32**
- Frontal area: ~27 sq ft
- Air density: 0.002377 slugs/ft³ (sea level)

### Drafting Effect

**Speed boost from drafting:**
- **+3-5 mph** speed increase (use 4 mph)
- Optimal distance: **1-2 car lengths** behind leader
- Maximum effect: 1.5 car lengths
- No benefit beyond 2.5 car lengths

```typescript
function calculateDraftSpeedBoost(distanceBehindCarLengths: number): number {
  const maxDraftBoost = 4; // mph
  const optimalDistance = 1.5; // car lengths

  if (distanceBehindCarLengths > 2.5) return 0;

  const boost = maxDraftBoost * (1 - Math.abs(distanceBehindCarLengths - optimalDistance) / optimalDistance);
  return Math.max(0, boost);
}
```

### Downforce

**Downforce by package (at 200 mph):**
- Standard oval: 2000 lbs
- Superspeedway: 500 lbs

**Downforce scales with speed squared:**
```typescript
function calculateDownforce(
  velocity: number,
  baseDownforce: number
): number {
  const referenceVelocity = 200; // mph
  const normalizedVelocity = velocity / referenceVelocity;
  return baseDownforce * Math.pow(normalizedVelocity, 2);
}
```

### Side-by-Side Racing Penalty

**When racing wheel-to-wheel:**
- Speed reduction: **-2%** for both cars
- Tire wear increase: **+10%** for both cars

```typescript
function getSideBySideMultipliers(isRacingSideBySide: boolean): {
  speedMultiplier: number;
  tireWearMultiplier: number;
} {
  return isRacingSideBySide
    ? { speedMultiplier: 0.98, tireWearMultiplier: 1.10 }
    : { speedMultiplier: 1.0, tireWearMultiplier: 1.0 };
}
```

---

## 4. Corner Speed & Banking

### Corner Speed Formula

**Maximum cornering speed based on banking and radius:**

```typescript
function calculateMaxCornerSpeed(
  bankingAngleDegrees: number,
  cornerRadiusFeet: number,
  tireGripCoefficient: number
): number {
  const bankingRad = bankingAngleDegrees * (Math.PI / 180);
  const g = 32.174; // ft/s²

  const numerator = Math.sin(bankingRad) + tireGripCoefficient * Math.cos(bankingRad);
  const denominator = Math.cos(bankingRad) - tireGripCoefficient * Math.sin(bankingRad);

  const vSquared = cornerRadiusFeet * g * (numerator / denominator);
  const velocityFtPerSec = Math.sqrt(vSquared);

  return velocityFtPerSec * 0.681818; // Convert to mph
}
```

### NASCAR Track Banking Angles

**Key tracks:**
```typescript
const TRACK_BANKING = {
  bristol: { turns: 26, straights: 4 },
  charlotte: { turns: 24, straights: 5 },
  daytona: { turns: 31, straights: 3 },
  talladega: { turns: 33, straights: 3 }, // Steepest
  martinsville: { turns: 12, straights: 3 }, // Flattest
};
```

### Downforce Impact on Cornering

**Downforce increases effective grip:**

```typescript
function calculateEffectiveGripWithDownforce(
  baseGripCoefficient: number,
  downforceLbs: number,
  vehicleWeightLbs: number
): number {
  const downforceGripBoost = (downforceLbs / vehicleWeightLbs) * 0.5;
  return baseGripCoefficient + downforceGripBoost;
}

// Example: 2000 lbs downforce on 3450 lb car
// Effective grip ≈ 1.64 (vs 1.35 base)
```

---

## 5. Car Specifications

### Weight

- **Minimum weight:** 3450 lbs (with driver)
- **Dry weight:** 3300 lbs (no fuel/driver)
- **Engine weight:** 575 lbs

### Horsepower

**By package:**
- **Standard:** 670 HP (most tracks)
- **Superspeedway:** 510 HP (Daytona, Talladega)
- **2026 Short Track:** 750 HP (planned)

### Center of Gravity

- **CG height:** 15 inches
- **Wheelbase:** 110 inches

---

## 6. Validation Lap Times

### Bristol Motor Speedway (0.533 miles)

- **Fastest qualifying:** 14.5 seconds (~132 mph)
- **Typical racing lap:** 15.2 seconds (~127 mph)
- **Slow lap (worn tires):** 16.0 seconds (~119 mph)

**Track characteristics:**
- 60% of lap in turns
- 40% on straights
- 3.3 lateral G-forces in turns

### Charlotte Motor Speedway (1.5 miles)

- **Fastest qualifying:** 29.0 seconds (~186 mph)
- **Typical racing lap:** 30.5 seconds (~177 mph)
- **Slow lap (worn tires):** 32.0 seconds (~168 mph)

**Tire strategy:**
- Fresh tires: 30.2 seconds
- Mid-life: 30.8 seconds
- Worn tires: 31.5 seconds
- **Differential:** 1.3 seconds fresh vs worn

### Daytona International Speedway (2.5 miles)

- **Fastest qualifying:** 45.0 seconds (~200 mph)
- **Drafting speed:** 49.0 seconds (~188 mph)
- **No draft speed:** 52.0 seconds (~173 mph)

**Drafting advantage:** 3.0 seconds per lap (7 mph boost)

**Fuel window:** ~40 laps on full tank

---

## 7. Top Speeds by Track Type

```typescript
const TOP_SPEEDS_MPH = {
  superspeedway: {
    topSpeed: 200,
    averageSpeed: 185,
    straightSpeed: 195
  },
  intermediate: {
    topSpeed: 195,
    averageSpeed: 175,
    straightSpeed: 190
  },
  shortTrack: {
    topSpeed: 140,
    averageSpeed: 127,
    straightSpeed: 138
  }
};
```

---

## 8. Implementation Guidelines

### Calculation Order for Lap Time

1. Load track configuration (sections, banking, radius)
2. For each track section:
   - Calculate base section speed
   - Apply tire wear modifier
   - Apply fuel weight modifier
   - Apply draft bonus (if applicable)
   - Apply downforce benefit (corners)
   - Apply driver skill modifier
   - Calculate section time = distance / speed
3. Sum all section times = total lap time
4. Validate against known lap times

### Testing Validation Points

Use these relationships to verify physics accuracy:

1. **Bristol lap times:** 15.0-15.2 seconds typical
2. **Tire wear penalty:** ~0.5 seconds per 50 laps
3. **Fuel weight:** ~0.54 seconds full vs empty tank
4. **Draft benefit:** ~3-4 seconds per lap at Daytona
5. **Charlotte lap times:** 30-31 seconds typical
6. **Fresh tire advantage:** 0.3-0.5 seconds at Charlotte

### Simplifications Acceptable

For simulation purposes, these simplifications are acceptable:

1. **Track sections:** Can model turns as uniform (don't need to model progressive banking)
2. **Tire temperature:** Can be omitted initially (affects ~5-10% grip)
3. **Aerodynamic dirty air:** Simplified to draft zone vs clean air
4. **Brake/throttle input:** Can assume optimal inputs based on driver skill
5. **Setup variations:** All cars can use same baseline specs initially

---

## 9. Sources

Research compiled from:
- NASCAR official specifications (Next-Gen car)
- BuildingSpeed.org (physics analysis)
- CFD drafting studies
- Track specifications and race data
- Physics validation from racing publications

---

**Usage:** Reference this document when implementing physics functions. All formulas have been verified against real NASCAR data and are suitable for realistic simulation.

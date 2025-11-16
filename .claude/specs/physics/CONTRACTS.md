# Physics Contracts

**Sync Status:** ⏳ Pending (Phase 2 Migration)
**Last Checked:** 2025-11-16
**Source of Truth:** `src/types.ts`

---

## Overview

TypeScript interfaces and types specific to the Physics specification.

**Purpose:** Document the contracts (interfaces) that define physics-related data structures and ensure they remain synchronized with the implementation.

---

## Design-Time Contracts

These are the **intended** interfaces documented at design time. The actual implementation lives in `src/types.ts`.

**TODO for Phase 2:** Extract physics-related interfaces from `src/types.ts` and document them here with full explanations, validation rules, and usage examples.

---

## Interfaces to Document

### Track Interface

**Purpose:** Defines track specifications for physics calculations

**TODO:** Extract from `src/types.ts` and document:
- Purpose of each property
- Validation rules (e.g., banking 0-40°, length >0.5 miles)
- Usage examples
- Track section definitions

---

### CarState Interface

**Purpose:** Current car condition affecting physics

**TODO:** Extract from `src/types.ts` and document:
- Tire wear percentage (0-100)
- Fuel level (gallons or percentage)
- Damage level (future)
- How state affects calculations

---

### PhysicsConstants

**Purpose:** NASCAR-specific physics constants

**TODO:** Document all constants:
- Drag coefficient (0.32)
- Downforce values by package
- Tire grip coefficients
- Fuel density
- Gravity constant

**Source:** `docs/PHYSICS-REFERENCE.md` → migrate to `REFERENCE.md`

---

## Contract Validation Rules

**TODO for Phase 2:**
- Define validation rules for each interface
- Specify allowed value ranges
- Document constraints and invariants

---

## Contract Changes

### Proposed Changes

None currently.

### Change History

| Date | Change | Impact | Status |
|------|--------|--------|--------|
| 2025-11-16 | Structure created | None (templates only) | Complete |

---

## Sync Validation

**Script:** `scripts/sync-contracts.sh` (Phase 1 - To be created)

**Process:**
1. Extract interfaces from `src/types.ts`
2. Compare with documented interfaces in this file
3. Report mismatches
4. Require manual resolution

**Example Output:**
```
Physics contracts sync check:
✅ Track interface: Documented and matches implementation
❌ CarState interface: Missing 'damage' property in documentation
⚠️  PhysicsConstants: New constant 'MAX_BANKING' added to types.ts but not documented
```

---

## Usage Examples

**TODO for Phase 2:** Add TypeScript usage examples showing:
- How to create valid Track instances
- How to update CarState
- How to use PhysicsConstants in calculations

---

**Phase 1 Status:** Template created, awaiting Phase 2 content migration

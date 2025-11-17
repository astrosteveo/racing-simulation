# [Spec Name] Contracts

**Purpose:** Interface documentation and API contracts
**Last Updated:** YYYY-MM-DD

---

## Overview

This document defines the stable interfaces and contracts for [Spec Name].

**Contract Stability:**
- ✅ **Stable** - Interface is locked, breaking changes require major version
- ⚠️ **Evolving** - Interface may change, marked with deprecation warnings
- 🔬 **Experimental** - Interface may change without notice

---

## Core Interfaces

### [InterfaceName]

**Status:** ✅ Stable / ⚠️ Evolving / 🔬 Experimental
**Location:** `src/types.ts` or `src/path/to/interface.ts`

```typescript
export interface [InterfaceName] {
  // TODO: Define interface properties
  property1: string;
  property2: number;
  optionalProp?: boolean;
}
```

**Purpose:** TODO: What does this interface represent?

**Usage:**
```typescript
// TODO: Example usage
const example: [InterfaceName] = {
  property1: 'value',
  property2: 42
};
```

**Validation Rules:**
- TODO: property1 must be non-empty
- TODO: property2 must be >= 0
- TODO: Additional constraints

**Related Interfaces:**
- TODO: Other interfaces this connects to

---

## Function Contracts

### `[functionName]()`

**Status:** ✅ Stable

```typescript
function [functionName](
  param1: Type1,
  param2: Type2
): ReturnType;
```

**Purpose:** TODO: What does this function do?

**Parameters:**
- `param1`: TODO: Description, constraints, examples
- `param2`: TODO: Description, constraints, examples

**Returns:**
- TODO: Return value description
- TODO: Possible return values/states

**Throws:**
- `ErrorType`: When TODO: error condition
- `AnotherError`: When TODO: another condition

**Guarantees:**
- TODO: What is guaranteed after this function runs
- TODO: Side effects, if any

**Example:**
```typescript
const result = [functionName](value1, value2);
// TODO: Show usage
```

---

## Data Contracts

### [DataStructureName]

**Format:** JSON / TypeScript / Other
**Schema:**

```json
{
  "property1": "string",
  "property2": 123,
  "nested": {
    "prop": true
  }
}
```

**Field Descriptions:**
- `property1`: TODO: Purpose, constraints, examples
- `property2`: TODO: Purpose, range, units
- `nested.prop`: TODO: Purpose

**Validation:**
- TODO: Schema validation rules
- TODO: Business logic constraints

---

## Events / Messages

### [EventName]

**Type:** Event / Message / Notification

**Payload:**
```typescript
interface [EventName]Payload {
  // TODO: Define event payload
}
```

**When Fired:**
- TODO: Condition 1 that triggers event
- TODO: Condition 2 that triggers event

**Consumers:**
- TODO: Who listens to this event
- TODO: Expected reactions

---

## State Contracts

### [StateName]

**Valid States:**
```
[State 1] → [State 2] → [State 3]
```

**State Transitions:**
- `[State 1]` → `[State 2]`: When TODO: transition condition
- `[State 2]` → `[State 3]`: When TODO: transition condition

**Invariants:**
- TODO: Condition that must always be true
- TODO: State constraints

---

## Backward Compatibility

**Breaking Changes:**
- TODO: Document any breaking changes from previous versions
- TODO: Migration guide if applicable

**Deprecations:**
- `[OldInterface]`: Deprecated in v[X.Y], remove in v[A.B]
  - **Replacement:** Use `[NewInterface]` instead
  - **Migration:** TODO: How to migrate

---

## Testing Contracts

**Test Coverage Requirements:**
- All public interfaces must have tests
- Edge cases TODO: specific requirements
- Contract validation tests TODO: what to validate

**Mock Contracts:**
```typescript
// TODO: Standard mocks for testing
export const mock[InterfaceName]: [InterfaceName] = {
  property1: 'test-value',
  property2: 123
};
```

---

## Notes

**Design Rationale:**
- TODO: Why these interfaces were chosen
- TODO: Alternative approaches considered

**Future Considerations:**
- TODO: Potential interface expansions
- TODO: Compatibility concerns

---

**Last Updated:** YYYY-MM-DD
**Contract Version:** 1.0

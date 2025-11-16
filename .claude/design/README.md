# Feature Design Documents

This directory contains implementation planning artifacts created during feature development.

## Purpose

These are **Claude Code context documents** - they help the AI understand:
- Why features were designed the way they were
- Implementation details and architecture decisions
- Testing strategies and success criteria
- Integration points with existing systems

## When to Read

- **Planning a new feature:** Read similar feature design docs for patterns
- **Modifying existing feature:** Read the relevant design doc for context
- **Understanding design decisions:** When you need to know "why did we build it this way?"

**Don't read routinely** - these are reference docs, not session state.

## Current Design Docs

- `decision-system.md` - Decision system (Phase 4)
  - Skill-based outcome calculation
  - Decision types and triggers
  - Mental state integration

- `console-ui.md` - Console UI (Phase 5)
  - UIRenderer implementation
  - Display components and formatting
  - Live race display, results, prompts

## Best Practices

**Creating new design docs:**
1. Create during planning phase (before implementation)
2. Include: Overview, Architecture, Components, Testing Strategy, Success Criteria
3. Keep implementation-focused (not user documentation)
4. Reference from TASKS.md when working on the feature

**Updating design docs:**
- Update when architecture changes significantly
- Don't update for minor tweaks (those go in code comments)
- Archive if feature is completely replaced

## Token Efficiency

These docs are **210-227 lines each** - only read when specifically working on their features.

For general project understanding, read:
- `.claude/QUICKSTART.md` - Full project context in 200 lines
- `.claude/TASKS.md` - Current work and priorities
- `docs/ARCHITECTURE.md` - System-wide design (when needed)

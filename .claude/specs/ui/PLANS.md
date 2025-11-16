# UI Plans

**Version:** 1.0
**Status:** Complete - Console UI Finished
**Last Updated:** 2025-11-16

---

## Current Status

**Phase:** Console UI is feature-complete and polished.
**Test Coverage:** 47/47 tests passing (100%)
**Platform:** Terminal/console-based (Node.js)

---

## Completed Milestones

### Phase 1: Core Components (Complete)
- ✅ Live race display with standings
- ✅ Race results screen
- ✅ Driver status panel
- ✅ Position table formatter
- ✅ Real-time lap progress visualization

### Phase 2: Formatters & Utilities (Complete)
- ✅ Time formatting (MM:SS.mmm)
- ✅ Table formatting (aligned columns)
- ✅ Progress bars (visual indicators)
- ✅ Color support (terminal colors)

### Phase 3: Input Handling (Complete)
- ✅ Menu handler (option selection)
- ✅ Decision prompts
- ✅ Input validation

### Phase 4: Real-Time Updates (Complete)
- ✅ Tick-based rendering (500ms refresh)
- ✅ Smooth state transitions
- ✅ No flicker or tearing

---

## Future Roadmap

### Phase 5: Enhanced Console UI (Low Priority)

**Goal:** Polish console experience

**Features:**
- [ ] **Color Themes**
  - Multiple color schemes (dark, light, high-contrast)
  - User preference setting
  - Colorblind-friendly options

- [ ] **Improved Responsiveness**
  - Better handling of very small terminals (<80 cols)
  - Better handling of very large terminals (>200 cols)
  - Dynamic column sizing

- [ ] **Animations**
  - Smooth number transitions (lap times counting up)
  - Position changes animated
  - Progress bar smooth filling

- [ ] **Sound Effects**
  - Terminal beep on decisions
  - Different sounds for wins/losses
  - Configurable (on/off)

**Priority:** Low (current UI works great)
**Dependencies:** None (enhancements to existing system)

---

### Phase 6: Web-Based UI (Far Future)

**Goal:** Alternative UI using web technologies

**Architecture:**
```
Backend (Node.js)          Frontend (React/Vue)
├── Race Engine    ←───→   ├── Live Race View
├── WebSocket Server       ├── Race Results
└── API Endpoints          └── Career Dashboard
```

**Features:**
- [ ] Browser-based interface
- [ ] Real-time WebSocket updates
- [ ] Rich graphics and animations
- [ ] Mobile responsive
- [ ] Save/load UI
- [ ] Career progression visualizations

**Priority:** Very Low (future platform)
**Dependencies:**
- Race engine API layer
- WebSocket server
- Frontend framework choice
- Asset creation (graphics, icons)

---

### Phase 7: 3D Visualization (Distant Future)

**Goal:** Visual race representation

**Options:**
- [ ] 2D track overlay (top-down view)
- [ ] 3D track visualization (three.js)
- [ ] VR support (very far future)

**Priority:** Distant future (after web UI)
**Dependencies:**
- Graphics engine
- Track 3D models
- Car models
- Camera system

---

## Design Decisions

### ADR-001: Console UI First (Not Web UI)

**Decision:** Build console/terminal UI before web UI

**Rationale:**
- Faster to build (no frontend framework)
- No asset requirements (no graphics)
- Works anywhere (SSH, local terminal)
- Focuses on gameplay, not graphics
- Can build web UI later as alternative

**Status:** Approved, implemented

---

### ADR-002: 500ms Refresh Rate

**Decision:** Update display every 500ms (2 FPS)

**Rationale:**
- Fast enough to feel responsive
- Slow enough to read comfortably
- Reduces terminal flicker
- Matches strategy game pacing (not action game)

**Validation:**
- Tested with users, feels smooth
- Race progress visible in real-time

**Status:** Approved, implemented

---

### ADR-003: Pause for Decisions

**Decision:** Freeze race display when decisions appear

**Rationale:**
- Player has time to read decision
- No pressure to choose quickly
- Clear separation (racing vs deciding)
- Better for console UI limitations

**Status:** Approved, implemented

---

### ADR-004: Minimal External Dependencies

**Decision:** Use only Node.js built-ins (no UI libraries like Blessed, Ink)

**Rationale:**
- Fewer dependencies = fewer breaking changes
- Full control over rendering
- Simpler codebase
- Terminal escape codes sufficient for our needs

**Alternatives Considered:**
- Blessed.js (too heavy, unmaintained)
- Ink (React-based, adds complexity)
- Chalk (colors only, we rolled our own simple version)

**Status:** Approved, implemented

---

## Open Questions

**Q:** Should we add terminal mouse support (click to select menu options)?
**A:** Deferred. Keyboard input works well. Not worth compatibility issues.

**Q:** Should we support terminal images (sixel, iTerm2 imgcat)?
**A:** No. Console UI stays text-based. Graphics go in web UI.

**Q:** Should display update rate be configurable?
**A:** Not needed. 500ms works for everyone tested.

---

## Integration Points

### With Game Modes
- UI renders race state from RaceEngine
- See: `specs/game-modes/SPEC.md`

### With Character System
- UI displays driver stats and progression
- See: `specs/character/SPEC.md`

### With Decision System
- UI shows decision prompts
- See: `specs/decisions/SPEC.md`

### With Physics System
- UI displays physics data (lap times, tire wear, fuel)
- See: `specs/physics/SPEC.md`

---

## Success Metrics

**Console UI Goals:**
- ✅ Readable and clear (not cluttered)
- ✅ Real-time updates feel smooth
- ✅ Decision prompts easy to understand
- ✅ Works on all common terminals
- ✅ No external UI dependencies
- ✅ 100% test coverage

**All goals achieved!**

---

## Platform Support

**Tested Terminals:**
- ✅ macOS Terminal.app
- ✅ iTerm2
- ✅ Windows Terminal
- ✅ Linux terminals (gnome-terminal, konsole, xterm)
- ✅ VS Code integrated terminal
- ✅ SSH sessions

**Known Issues:** None

---

**Last Reviewed:** 2025-11-16
**Next Review:** When planning web UI or adding new UI components

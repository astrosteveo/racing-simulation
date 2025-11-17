# Git Hooks Documentation

**Purpose:** Automated enforcement of TDD discipline and quality gates
**Last Updated:** 2025-11-16

---

## Overview

This project uses a **hybrid hooks system** combining Git bash hooks (hard enforcement) and Claude hooks (educational reminders).

### System Architecture

```
┌─────────────────────────────────────────────────┐
│              Developer Action                    │
└─────────────────────────────────────────────────┘
                      ↓
         ┌────────────┴────────────┐
         │                         │
    Claude Tool                Git Command
         │                         │
         ↓                         │
  Claude Hook                      ↓
  (PostToolUse)                Git Hook
         │                   (pre-*/post-*)
         │                         │
    Educational              Enforcement
    Automation                Validation
    Suggestions                Blocking
         │                         │
         └────────────┬────────────┘
                      ↓
              Quality Codebase
```

---

## Git Hooks (Hard Enforcement)

### pre-commit

**Purpose:** Block commits that fail quality checks

**Runs:**
1. `npm run test:run` - All tests must pass
2. `npm run type-check` - No TypeScript errors
3. `npm run lint` - No linting errors

**Location:** `.git/hooks/pre-commit` (installed from `.claude/hooks/pre-commit`)

**Bypass:** `git commit --no-verify` (emergency only!)

**Example Output:**
```
🚦 Pre-commit Quality Gate
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Check 1/3: Running tests...
   ✅ All tests passing

📋 Check 2/3: Running TypeScript type check...
   ✅ No TypeScript errors

📋 Check 3/3: Running ESLint...
   ✅ No linting errors

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ All quality checks passed! Proceeding with commit...
```

---

### commit-msg

**Purpose:** Enforce commit message format

**Format:** `Action: description`

**Valid Actions:**
- `Add:` - New feature or functionality
- `Fix:` - Bug fix or correction
- `Update:` - Enhancement to existing feature
- `Remove:` - Delete code or feature
- `Refactor:` - Code restructuring without behavior change
- `Test:` - Add or update tests
- `Docs:` - Documentation changes

**Location:** `.git/hooks/commit-msg`

**Bypass:** `git commit --no-verify`

**Examples:**
- ✅ `Add: tire temperature tracking to physics engine`
- ✅ `Fix: Bristol lap time calibration off by 0.5s`
- ✅ `Update: career mode to support multi-season progression`
- ❌ `updated stuff` (no action, lowercase)
- ❌ `WIP` (not descriptive)

---

### post-commit

**Purpose:** Remind about documentation sync (non-blocking)

**Displays:**
- Commit hash and message
- Documentation update checklist
- Reminder about `npm run verify-docs`

**Location:** `.git/hooks/post-commit`

**No bypass needed** (non-blocking)

**Example Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Commit successful: a1b2c3d
   Add: tire temperature tracking
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Post-commit checklist:

   1. Update STATUS.md Recent Changes
      Add: a1b2c3d - Add: tire temperature tracking

   2. Run documentation sync:
      npm run verify-docs

   3. Update relevant specs/*/TASKS.md:
      - Mark task complete if finished
      - Update test status if tests changed
      - Move to next task if ready
```

---

### pre-push

**Purpose:** Block push if documentation is out of sync

**Runs:**
- `npm run verify-docs` - Must pass before push

**Checks:**
- STATUS.md Recent Changes synced with git log
- Test status up to date
- No uncommitted changes to living docs
- README.md Last Updated current

**Location:** `.git/hooks/pre-push`

**Bypass:** `git push --no-verify` (emergency only!)

---

## Hook Installation

### Automatic Installation (Recommended)

Hooks are installed automatically when you run:

```bash
npm install
# or
npm run prepare
```

The `prepare` script runs `scripts/install-hooks.sh` which:
1. Copies hooks from `.claude/hooks/` to `.git/hooks/`
2. Makes them executable (`chmod +x`)
3. Confirms installation

### Manual Installation

```bash
bash scripts/install-hooks.sh
```

### Verify Installation

```bash
ls -la .git/hooks/
```

You should see:
- `pre-commit` (executable)
- `commit-msg` (executable)
- `post-commit` (executable)
- `pre-push` (executable)

---

## Claude Hooks (Educational, Non-Blocking)

**Config:** `.claude/settings.json`

**Purpose:** Context-aware reminders and automated documentation updates

### Features

**1. Auto-run documentation sync:**
- After `npm run test:run` → Auto-runs `npm run test:status`
- After editing `src/types.ts` → Auto-runs `npm run sync-contracts`

**2. TDD workflow reminders:**
- When running single test files → Shows TDD cycle reminder
- When editing source → Reminds about test-first
- When creating test files → Shows next steps

**3. Smart context extraction:**
- Parses file paths from tool arguments
- Provides file-specific guidance
- Suggests related files

**4. Git operation hints:**
- Before commits → Pre-commit checklist
- After commits → Documentation sync reminder
- Before push → Final verification reminder

### Example Claude Hook Output

**After editing `src/types.ts`:**
```
📝 EDITED: src/types.ts (CONTRACT CHANGE)

⚠️  Interface changes impact:
   - All implementations using this interface
   - Relevant specs/*/CONTRACTS.md documentation
   - Test files validating the contract

🔧 Running contract sync check...
✅ Contracts in sync!
```

**After running tests:**
```
🧪 Tests completed!
✅ Test status auto-updated in STATUS.md and README.md

💡 Next: Run npm run verify-docs to check all sync
```

---

## Bypassing Hooks

### When to Bypass

**Acceptable scenarios:**
1. Emergency hotfix (must add tests in follow-up commit)
2. Documentation-only changes (if tests aren't relevant)
3. Work-in-progress spike (exploration, not production)

**Always document why you bypassed!**

### How to Bypass

**Single commit:**
```bash
git commit --no-verify -m "Fix: emergency production issue"
```

**Single push:**
```bash
git push --no-verify
```

**Temporary disable (not recommended):**
```bash
mv .git/hooks/pre-commit .git/hooks/pre-commit.disabled
# Do your work
mv .git/hooks/pre-commit.disabled .git/hooks/pre-commit
```

---

## Troubleshooting

### Hooks Not Running

**Check if hooks are installed:**
```bash
ls -la .git/hooks/
```

**Reinstall:**
```bash
npm run prepare
```

### pre-commit Blocking Incorrectly

**Run checks manually to see failures:**
```bash
npm run test:run
npm run type-check
npm run lint
```

**Fix failures, then commit normally.**

### commit-msg Rejecting Valid Messages

**Ensure format is exactly:**
```
Action: description
```

**Common mistakes:**
- Lowercase action (should be `Add:` not `add:`)
- Missing colon
- No space after colon
- No description

---

## Maintenance

### Updating Hooks

1. Edit hook template in `.claude/hooks/`
2. Run `npm run prepare` to reinstall
3. Test the updated hook
4. Commit the template change

### Adding New Hooks

1. Create new hook template in `.claude/hooks/`
2. Update `scripts/install-hooks.sh` to include new hook
3. Update this README with documentation
4. Run `npm run prepare` to install
5. Test the new hook

---

## Testing Hooks

### Test pre-commit

**Create failing test:**
```bash
# Edit a test file to make it fail
npm run test:run  # Verify it fails
git add .
git commit -m "Test: hook test"
# Should be blocked
```

**Fix test and retry:**
```bash
# Fix the test
npm run test:run  # Verify it passes
git commit -m "Test: hook test"
# Should succeed
```

### Test commit-msg

**Try invalid message:**
```bash
git commit -m "invalid message"
# Should be blocked
```

**Try valid message:**
```bash
git commit -m "Test: commit message validation"
# Should succeed
```

### Test pre-push

**Create doc drift:**
```bash
# Make a commit without updating STATUS.md
git push
# Should be blocked if verify-docs fails
```

---

## Philosophy

**Why hooks?**
- Prevent bad commits from entering history
- Enforce TDD discipline automatically
- Reduce code review burden
- Maintain clean commit messages
- Keep documentation synced

**Two-tier approach:**
- **Git hooks:** Hard enforcement (block bad commits)
- **Claude hooks:** Education (guide good practices)

**Together:** Sustainable development without friction.

---

**Version:** 1.0
**Last Updated:** 2025-11-16
**See:** `.claude/CLAUDE.md` for complete development workflow

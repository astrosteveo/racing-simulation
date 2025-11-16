# Claude Code Hooks

This directory contains Claude Code hooks that enforce quality standards and TDD workflow.

## Installed Hooks

### pre-bash-hook

**Triggers:** Before bash commands (specifically `git commit` commands)

**Purpose:** Prevents committing broken code

**Checks:**
- ✅ TypeScript type checking (`npm run type-check`)
- ✅ Full test suite (`npm test`)
- ✅ ESLint linting (`npm run lint`)

**Behavior:**
- If any check fails, the commit is blocked
- All checks must pass before code can be committed
- Ensures every commit is a working, tested state (rollback safety)

**Example output:**
```
🔍 Pre-commit checks running...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Running TypeScript type check...
✅ Type check passed
🧪 Running test suite...
✅ All tests passed
🧹 Running ESLint...
✅ Linting passed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ All pre-commit checks passed! Proceeding with commit...
```

---

### post-write-hook

**Triggers:** After creating new files

**Purpose:** Immediate feedback on new code via automated testing

**Behavior:**
- Detects which part of codebase was modified
- Runs relevant tests automatically
- Provides instant validation of new code

**Test routing:**
- `src/engine/physics/*` → Runs physics unit tests
- `src/character/*` → Runs character unit tests
- `src/events/*` → Runs events unit tests
- `src/engine/simulation/*` → Runs integration tests
- `src/types.ts` → Runs full type check
- `*.test.ts` files → Runs that specific test
- `src/data/*.json` → Suggests validation

**Example output:**
```
📝 Post-write hook triggered for: src/engine/physics/tires.ts
🧪 Running physics tests...
✅ Physics tests passed
```

---

### post-edit-hook

**Triggers:** After editing existing files

**Purpose:** Catch breaking changes and type errors immediately

**Behavior:**
- Type checks TypeScript files
- Auto-fixes lint issues where possible
- **CRITICAL:** Detects changes to `types.ts` (potential breaking changes)
- Validates JSON syntax for data files
- Reminds about TDD if implementation has no tests

**Special handling for types.ts:**
```
⚠️  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  TYPES.TS MODIFIED - POTENTIAL BREAKING CHANGE!
⚠️  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Running full type check across project...
🧪 Running full test suite to verify contract compatibility...

💡 Reminder: Types are contracts. Changes affect ALL implementations.
```

**Example output:**
```
✏️  Post-edit hook triggered for: src/character/driver.ts
🔍 Type checking...
✅ No type errors
🧹 Auto-fixing lint issues...
✅ Linting complete
✅ Test file exists for this implementation
```

---

## How Hooks Enforce TDD Workflow

1. **Write Test** (new file)
   - post-write-hook: Runs the test file → Should fail (red)

2. **Write Implementation** (new file)
   - post-write-hook: Auto-runs relevant tests → Should pass (green)

3. **Edit/Refactor** (edit file)
   - post-edit-hook: Type checks + lints → Catches errors immediately

4. **Commit** (git commit)
   - pre-bash-hook: Verifies tests + types + lint → Only commits if all pass

Result: Can't commit broken code, tests run automatically, immediate feedback.

## Hook Maintenance

### Disabling a Hook Temporarily

If you need to bypass a hook for a specific commit:

```bash
# This disables hooks for a single commit (NOT RECOMMENDED)
git commit --no-verify -m "Emergency fix"
```

**⚠️ Warning:** Only use `--no-verify` in genuine emergencies. Bypassing hooks defeats their purpose.

### Modifying Hooks

Hooks are bash scripts in this directory. To modify:

1. Edit the hook file
2. Test syntax: `bash -n .claude/hooks/[hook-name]`
3. Test functionality manually
4. Commit the updated hook

### Adding New Hooks

Claude Code supports these hook types:
- `pre-bash-hook` - Before bash commands
- `post-bash-hook` - After bash commands
- `pre-write-hook` - Before writing files
- `post-write-hook` - After writing files
- `pre-edit-hook` - Before editing files
- `post-edit-hook` - After editing files
- `user-prompt-submit-hook` - When user submits a prompt

Create new hooks as needed, make them executable (`chmod +x`), and document them here.

## Troubleshooting

### Hook not running

**Check:**
1. Is the file executable? `ls -lah .claude/hooks/`
2. Is the syntax valid? `bash -n .claude/hooks/[hook-name]`
3. Is npm available? `which npm`
4. Are dependencies installed? `npm install`

### Hook causing errors

**Debug:**
1. Run the hook manually: `./.claude/hooks/[hook-name] [args]`
2. Check script output for error messages
3. Verify npm scripts work: `npm run type-check`, `npm test`, `npm run lint`

### Tests taking too long

The pre-commit hook runs the full test suite. As the test suite grows:

**Options:**
1. Optimize slow tests
2. Run only affected tests (requires setup)
3. Use `git commit --no-verify` sparingly for WIP commits (still must pass before merging)

## Philosophy

These hooks implement the project philosophy from `.claude/CLAUDE.md`:

- **TDD is non-negotiable** → Hooks enforce it automatically
- **Commit frequently = safety** → Every commit is a working state
- **Test before implementation** → Can't commit untested code
- **Prevent restarts** → Catch breaking changes immediately

The hooks are your safety net. They prevent the mistakes that lead to the dreaded project restart.

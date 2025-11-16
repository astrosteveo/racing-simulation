# Hooks Migration Guide

## Current Status

This project has **legacy hook scripts** in this directory:
- `post-edit-hook` - Type checking and linting after edits
- `post-write-hook` - Similar validations for new files
- `pre-bash-hook` - Safety checks before bash commands

## Modern Approach (Recommended)

According to the [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks), hooks should be configured in `.claude/settings.json` instead of individual script files.

## Migration Steps

To migrate to the modern hooks system:

1. **Create `.claude/settings.json`** (if it doesn't exist)

2. **Convert hook scripts to settings format:**

```json
{
  "hooks": {
    "Edit": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "npm run type-check 2>&1 | head -10",
            "timeout": 30
          }
        ]
      },
      {
        "matcher": "types.ts",
        "hooks": [
          {
            "type": "command",
            "command": "npm test --run --reporter=basic 2>&1 | grep -E '(PASS|FAIL|Test Files)'",
            "timeout": 60
          }
        ]
      }
    ],
    "Write": [
      {
        "matcher": "*.ts",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint:fix \"$FILE_PATH\"",
            "timeout": 15
          }
        ]
      }
    ],
    "Bash": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Before executing this bash command, verify:\n1. It's safe (no destructive operations)\n2. It's necessary (can't use specialized tools instead)\n3. Paths are properly quoted if they contain spaces"
          }
        ]
      }
    ]
  }
}
```

3. **Test the new configuration**
   - Restart Claude Code
   - Run `/hooks` command to review active hooks
   - Make a test edit to verify hooks are firing

4. **Clean up legacy scripts** (once migration is verified)
   - Archive or delete the old hook script files
   - Keep this MIGRATION.md for reference

## Benefits of settings.json

- **Centralized configuration** - All hooks in one place
- **Better matching** - Regex patterns, wildcards, case sensitivity control
- **Environment variables** - Use `$CLAUDE_PROJECT_DIR` for portability
- **IDE integration** - Settings are version-controllable JSON
- **Live updates** - Review and apply changes via `/hooks` command

## Differences to Note

**Legacy (Script Files):**
- Hooks are individual bash scripts
- Must be executable (`chmod +x`)
- Run in sequence with `$FILE_PATH` environment variable

**Modern (settings.json):**
- Hooks are JSON configurations
- Can be `"command"` (bash) or `"prompt"` (LLM evaluation)
- Supports multiple hooks per event with matcher patterns
- Can reference `$FILE_PATH`, `$CLAUDE_PROJECT_DIR`, etc.

## Keep Legacy Scripts?

You can keep the legacy scripts as templates or backup, but the modern approach is recommended for:
- Better maintainability
- Easier debugging (single file to check)
- More powerful matching and filtering
- Official Claude Code support

## Further Reading

- [Claude Code Hooks Documentation](https://code.claude.com/docs/en/hooks)
- [Settings File Reference](https://code.claude.com/docs/en/settings)

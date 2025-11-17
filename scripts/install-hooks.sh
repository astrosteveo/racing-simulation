#!/bin/bash
#
# Git hooks installation script
# Copies hook templates from .claude/hooks/ to .git/hooks/ and makes them executable
#
# Usage: bash scripts/install-hooks.sh
# Auto-run: npm run prepare (runs on npm install)
#

set -e  # Exit on error

HOOKS_DIR=".claude/hooks"
GIT_HOOKS_DIR=".git/hooks"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT"

echo ""
echo "🔧 Installing Git hooks..."
echo ""

# Check if .git directory exists
if [ ! -d "$GIT_HOOKS_DIR" ]; then
  echo "❌ Error: .git/hooks/ directory not found"
  echo "   Make sure you're in a git repository"
  exit 1
fi

# Check if hooks template directory exists
if [ ! -d "$HOOKS_DIR" ]; then
  echo "❌ Error: $HOOKS_DIR directory not found"
  echo "   Hook templates are missing"
  exit 1
fi

# Array of hook files to install
HOOKS=("pre-commit" "commit-msg" "post-commit" "pre-push")

INSTALLED_COUNT=0
SKIPPED_COUNT=0

# Install each hook
for HOOK in "${HOOKS[@]}"; do
  SOURCE="$HOOKS_DIR/$HOOK"
  TARGET="$GIT_HOOKS_DIR/$HOOK"

  if [ ! -f "$SOURCE" ]; then
    echo "⚠️  Warning: $SOURCE not found, skipping"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    continue
  fi

  # Copy hook to .git/hooks/
  cp "$SOURCE" "$TARGET"

  # Make executable
  chmod +x "$TARGET"

  echo "   ✅ Installed: $HOOK"
  INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Hook installation complete!"
echo ""
echo "   Installed: $INSTALLED_COUNT hooks"
if [ $SKIPPED_COUNT -gt 0 ]; then
  echo "   Skipped: $SKIPPED_COUNT hooks (not found)"
fi
echo ""
echo "📋 Installed hooks:"
echo "   - pre-commit:  Runs tests, type-check, lint (blocks bad commits)"
echo "   - commit-msg:  Enforces commit message format (blocks invalid messages)"
echo "   - post-commit: Displays documentation reminders (non-blocking)"
echo "   - pre-push:    Verifies documentation sync (blocks unsync'd pushes)"
echo ""
echo "💡 To bypass hooks (emergency only): git commit --no-verify"
echo ""

exit 0

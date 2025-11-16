#!/bin/bash
# Synchronize README.md with current project state
# Run this after completing major milestones

set -e

echo "🔄 Synchronizing README.md with project state..."
echo ""

# Get current date
TODAY=$(date +%Y-%m-%d)

# Get current phase from TASKS.md
CURRENT_PHASE=$(grep "^\*\*Current Phase:\*\*" .claude/TASKS.md | sed 's/\*\*Current Phase:\*\* //')

# Get test status from TASKS.md
TEST_STATUS=$(grep "^\*\*Overall:\*\*" .claude/TASKS.md | sed 's/\*\*Overall:\*\* //')

echo "📊 Current Status:"
echo "   Date: $TODAY"
echo "   Phase: $CURRENT_PHASE"
echo "   Tests: $TEST_STATUS"
echo ""

# Update README.md
README_FILE="README.md"

# Update Last Updated date
sed -i "s/\*\*Last Updated:\*\* [0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}/\*\*Last Updated:\*\* $TODAY/" "$README_FILE"

echo "✅ Updated Last Updated date in README.md"

# Run test status update script
if [ -f "scripts/update-test-status.sh" ]; then
  echo ""
  echo "🧪 Running test status update..."
  bash scripts/update-test-status.sh
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ README.md synchronized!"
echo ""
echo "📝 Manual checks still needed:"
echo "   1. Verify 'Current Status' narrative matches reality"
echo "   2. Update roadmap checkboxes (Phase sections)"
echo "   3. Update 'Features' list if new features added"
echo "   4. Check 'Known Issues' section"
echo ""
echo "💡 Then commit:"
echo "   git add README.md .claude/TASKS.md"
echo "   git commit -m 'Update README.md: $CURRENT_PHASE status'"

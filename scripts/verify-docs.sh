#!/bin/bash
# Documentation Verification Script
# Run this to check if living documents are in sync with project state

set -e

echo "🔍 Verifying living documentation..."
echo ""

ISSUES_FOUND=0

# Check 1: TASKS.md Recent Changes vs git log
echo "📋 Checking TASKS.md Recent Changes..."
LATEST_COMMIT=$(git log -1 --format="%h")
LATEST_FILES=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "")

# Skip check if latest commit ONLY modified TASKS.md (prevents chicken-egg problem)
if [ "$LATEST_FILES" = ".claude/TASKS.md" ]; then
  echo "   ✅ Latest commit is TASKS.md update (skipping self-reference check)"
elif ! grep -q "$LATEST_COMMIT" .claude/TASKS.md; then
  echo "   ❌ TASKS.md Recent Changes missing latest commit: $LATEST_COMMIT"
  echo "      Latest: $(git log -1 --oneline)"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "   ✅ Recent Changes includes latest commit"
fi
echo ""

# Check 2: TASKS.md timestamp freshness (should be updated within last 24 hours if working)
echo "📅 Checking TASKS.md timestamp..."
TASKS_UPDATED=$(grep "Last Updated:" .claude/TASKS.md | head -1 || echo "Last Updated: 1970-01-01")
TASKS_DATE=$(echo "$TASKS_UPDATED" | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}")
TODAY=$(date +%Y-%m-%d)

if [ "$TASKS_DATE" != "$TODAY" ]; then
  echo "   ⚠️  TASKS.md timestamp is not today ($TASKS_DATE)"
  echo "      Consider updating if actively working on project"
else
  echo "   ✅ Timestamp is current"
fi
echo ""

# Check 3: Test status freshness
echo "🧪 Checking if test status might be stale..."
LAST_TEST_COMMIT=$(git log --all --grep="test" -1 --format="%h" 2>/dev/null || echo "")
TASKS_TEST_STATUS=$(grep -A 5 "## Test Status" .claude/TASKS.md | head -6)

if [ -n "$LAST_TEST_COMMIT" ] && ! grep -q "$LAST_TEST_COMMIT" .claude/TASKS.md; then
  echo "   ⚠️  Test-related commit found, but test status may need update"
  echo "      Run: npm run test:run"
else
  echo "   ✅ Test status appears current"
fi
echo ""

# Check 4: Uncommitted changes to living docs
echo "📝 Checking for uncommitted documentation changes..."
if git diff --name-only | grep -qE "(TASKS.md|README.md|CLAUDE.md)"; then
  echo "   ⚠️  Uncommitted changes to living documents:"
  git diff --name-only | grep -E "(TASKS.md|README.md|CLAUDE.md)" | sed 's/^/      - /'
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "   ✅ No uncommitted documentation changes"
fi
echo ""

# Check 5: Current Work section in TASKS.md
echo "🎯 Checking TASKS.md Current Work section..."
if grep -A 3 "## Current Work" .claude/TASKS.md | grep -q "None"; then
  echo "   ✅ Current Work is clear (ready to start new task)"
elif grep -A 10 "## Current Work" .claude/TASKS.md | grep -q "✅"; then
  echo "   ⚠️  Current Work has completed items - should move to 'Completed This Session'"
else
  echo "   ✅ Current Work section has active tasks"
fi
echo ""

# Check 6: README.md sync with TASKS.md
echo "📄 Checking README.md sync with TASKS.md..."
TASKS_TEST_COUNTS=$(grep "^\*\*Overall:\*\*" .claude/TASKS.md | grep -oE "[0-9]+/[0-9]+" || echo "NOT_FOUND")
README_TEST_COUNTS=$(grep "^\*\*Test Pass Rate:\*\*" README.md | grep -oE "[0-9]+/[0-9]+" || echo "NOT_FOUND")

if [ "$TASKS_TEST_COUNTS" = "NOT_FOUND" ] || [ "$README_TEST_COUNTS" = "NOT_FOUND" ]; then
  echo "   ⚠️  Could not parse test status from documentation"
elif [ "$TASKS_TEST_COUNTS" != "$README_TEST_COUNTS" ]; then
  echo "   ❌ Test status mismatch between TASKS.md and README.md"
  echo "      TASKS.md: $TASKS_TEST_COUNTS"
  echo "      README.md: $README_TEST_COUNTS"
  echo "      Run: npm run sync-readme"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "   ✅ Test status synchronized between TASKS.md and README.md ($TASKS_TEST_COUNTS)"
fi
echo ""

# Check 7: README.md Last Updated date
echo "📅 Checking README.md freshness..."
README_DATE=$(grep "^\*\*Last Updated:\*\*" README.md | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}" || echo "1970-01-01")
TASKS_DATE=$(grep "^\*\*Last Updated:\*\*" .claude/TASKS.md | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}" || echo "1970-01-01")

# README should be updated within 7 days of TASKS.md if in active development
TASKS_EPOCH=$(date -d "$TASKS_DATE" +%s 2>/dev/null || echo "0")
README_EPOCH=$(date -d "$README_DATE" +%s 2>/dev/null || echo "0")
DAYS_DIFF=$(( (TASKS_EPOCH - README_EPOCH) / 86400 ))

if [ $DAYS_DIFF -gt 7 ]; then
  echo "   ⚠️  README.md is $DAYS_DIFF days behind TASKS.md"
  echo "      Consider running: npm run sync-readme"
else
  echo "   ✅ README.md is reasonably current"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ All documentation checks passed!"
  exit 0
else
  echo "⚠️  Found $ISSUES_FOUND issue(s) requiring attention"
  echo ""
  echo "💡 Quick fixes:"
  echo "   - Update .claude/TASKS.md Recent Changes"
  echo "   - Run: npm run test:status (update test status)"
  echo "   - Run: npm run sync-readme (sync README.md)"
  echo "   - Commit documentation changes"
  exit 1
fi

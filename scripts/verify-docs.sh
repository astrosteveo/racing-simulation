#!/bin/bash
# Documentation Verification Script
# Run this to check if living documents are in sync with project state

set -e

echo "🔍 Verifying living documentation (spec-centric architecture)..."
echo ""

ISSUES_FOUND=0

# Check 1: STATUS.md Recent Changes vs git log
echo "📋 Checking STATUS.md Recent Changes..."
LATEST_COMMIT=$(git log -1 --format="%h")
LATEST_FILES=$(git diff --name-only HEAD~1 HEAD 2>/dev/null || echo "")

# Skip check if latest commit ONLY modified STATUS.md (prevents chicken-egg problem)
if [ "$LATEST_FILES" = ".claude/STATUS.md" ]; then
  echo "   ✅ Latest commit is STATUS.md update (skipping self-reference check)"
elif ! grep -q "$LATEST_COMMIT" .claude/STATUS.md; then
  echo "   ❌ STATUS.md Recent Changes missing latest commit: $LATEST_COMMIT"
  echo "      Latest: $(git log -1 --oneline)"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "   ✅ Recent Changes includes latest commit"
fi
echo ""

# Check 2: STATUS.md timestamp freshness
echo "📅 Checking STATUS.md timestamp..."
STATUS_UPDATED=$(grep "Last Updated:" .claude/STATUS.md | head -1 || echo "Last Updated: 1970-01-01")
STATUS_DATE=$(echo "$STATUS_UPDATED" | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}")
TODAY=$(date +%Y-%m-%d)

if [ "$STATUS_DATE" != "$TODAY" ]; then
  echo "   ⚠️  STATUS.md timestamp is not today ($STATUS_DATE)"
  echo "      Consider updating if actively working on project"
else
  echo "   ✅ Timestamp is current"
fi
echo ""

# Check 3: Test status freshness
echo "🧪 Checking if test status might be stale..."
LAST_TEST_COMMIT=$(git log --all --grep="test" -1 --format="%h" 2>/dev/null || echo "")

if [ -n "$LAST_TEST_COMMIT" ] && ! grep -q "$LAST_TEST_COMMIT" .claude/STATUS.md; then
  echo "   ⚠️  Test-related commit found, but test status may need update"
  echo "      Run: npm run test:status"
else
  echo "   ✅ Test status appears current"
fi
echo ""

# Check 4: Uncommitted changes to living docs
echo "📝 Checking for uncommitted documentation changes..."
if git diff --name-only | grep -qE "(STATUS.md|TASKS.md|README.md|CLAUDE.md)"; then
  echo "   ⚠️  Uncommitted changes to living documents:"
  git diff --name-only | grep -E "(STATUS.md|TASKS.md|README.md|CLAUDE.md)" | sed 's/^/      - /'
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "   ✅ No uncommitted documentation changes"
fi
echo ""

# Check 5: Current Work section in STATUS.md
echo "🎯 Checking STATUS.md Active Work section..."
if grep -A 5 "## Active Work" .claude/STATUS.md | grep -q "complete"; then
  echo "   ✅ Active Work section updated"
else
  echo "   ⚠️  Active Work section may need updating"
fi
echo ""

# Check 6: README.md sync with STATUS.md
echo "📄 Checking README.md sync with STATUS.md..."
STATUS_TEST_COUNTS=$(grep "^\*\*Overall Tests:\*\*" .claude/STATUS.md | grep -oE "[0-9]+/[0-9]+" || echo "NOT_FOUND")
README_TEST_COUNTS=$(grep "^\*\*Test Pass Rate:\*\*" README.md | grep -oE "[0-9]+/[0-9]+" || echo "NOT_FOUND")

if [ "$STATUS_TEST_COUNTS" = "NOT_FOUND" ] || [ "$README_TEST_COUNTS" = "NOT_FOUND" ]; then
  echo "   ⚠️  Could not parse test status from documentation"
elif [ "$STATUS_TEST_COUNTS" != "$README_TEST_COUNTS" ]; then
  echo "   ❌ Test status mismatch between STATUS.md and README.md"
  echo "      STATUS.md: $STATUS_TEST_COUNTS"
  echo "      README.md: $README_TEST_COUNTS"
  echo "      Run: npm run sync-readme"
  ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
  echo "   ✅ Test status synchronized between STATUS.md and README.md ($STATUS_TEST_COUNTS)"
fi
echo ""

# Check 7: README.md Last Updated date
echo "📅 Checking README.md freshness..."
README_DATE=$(grep "^\*\*Last Updated:\*\*" README.md | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}" || echo "1970-01-01")
STATUS_DATE=$(grep "^\*\*Last Updated:\*\*" .claude/STATUS.md | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}" || echo "1970-01-01")

# README should be updated within 7 days of STATUS.md if in active development
STATUS_EPOCH=$(date -d "$STATUS_DATE" +%s 2>/dev/null || echo "0")
README_EPOCH=$(date -d "$README_DATE" +%s 2>/dev/null || echo "0")
DAYS_DIFF=$(( (STATUS_EPOCH - README_EPOCH) / 86400 ))

if [ $DAYS_DIFF -gt 7 ]; then
  echo "   ⚠️  README.md is $DAYS_DIFF days behind STATUS.md"
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
  echo "   - Update .claude/STATUS.md Recent Changes"
  echo "   - Update relevant specs/*/TASKS.md files"
  echo "   - Run: npm run test:status (update test status)"
  echo "   - Run: npm run sync-readme (sync README.md)"
  echo "   - Commit documentation changes"
  exit 1
fi

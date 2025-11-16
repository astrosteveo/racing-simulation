#!/bin/bash
# Update test status in TASKS.md and README.md automatically
# Run this after test suite to keep documentation in sync

set -e

echo "🧪 Running test suite..."
TEST_OUTPUT=$(npm run test:run 2>&1)

# Extract test summary
TOTAL_TESTS=$(echo "$TEST_OUTPUT" | grep -oP "Tests\s+\d+ failed \| \K\d+ passed" | grep -oP "\d+" || echo "0")
FAILED_TESTS=$(echo "$TEST_OUTPUT" | grep -oP "Tests\s+\K\d+ failed" | grep -oP "\d+" || echo "0")
TOTAL=$((TOTAL_TESTS + FAILED_TESTS))

if [ $TOTAL -eq 0 ]; then
  echo "❌ Could not parse test output. Run manually: npm run test:run"
  exit 1
fi

PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($TOTAL_TESTS / $TOTAL) * 100}")

echo ""
echo "📊 Test Results:"
echo "   Passing: $TOTAL_TESTS"
echo "   Failing: $FAILED_TESTS"
echo "   Total: $TOTAL"
echo "   Pass Rate: $PASS_RATE%"
echo ""

# Update TASKS.md
echo "📝 Updating .claude/TASKS.md..."
TASKS_FILE=".claude/TASKS.md"

# Update overall test status line
sed -i "s/\*\*Overall:\*\* [0-9]\+\/[0-9]\+ passing ([0-9.]\+%)/\*\*Overall:\*\* $TOTAL_TESTS\/$TOTAL passing ($PASS_RATE%)/" "$TASKS_FILE"

echo "   ✅ Updated test status in TASKS.md"

# Update README.md
echo "📝 Updating README.md..."
README_FILE="README.md"

# Update test pass rate in Project Status section
sed -i "s/\*\*Test Pass Rate:\*\* [0-9]\+\/[0-9]\+ tests passing ([0-9.]\+%)/\*\*Test Pass Rate:\*\* $TOTAL_TESTS\/$TOTAL tests passing ($PASS_RATE%)/" "$README_FILE"

echo "   ✅ Updated test status in README.md"
echo ""
echo "✅ Test status synchronized!"
echo ""
echo "💡 Next steps:"
echo "   1. Review failing tests in TASKS.md"
echo "   2. Update 'Failing Tests' section in TASKS.md if needed"
echo "   3. Commit changes: git add .claude/TASKS.md README.md && git commit -m 'Update test status: $TOTAL_TESTS/$TOTAL passing ($PASS_RATE%)'"

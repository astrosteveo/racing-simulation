#!/bin/bash
# Validate that "Next Up" tasks in TASKS.md follow actionable format
# Run this to ensure task descriptions are clear enough to resume work

set -e

echo "🔍 Validating TASKS.md task descriptions..."
echo ""

TASKS_FILE=".claude/TASKS.md"
ISSUES_FOUND=0

# Extract "Next Up" section
NEXT_UP_SECTION=$(sed -n '/^## Next Up/,/^## /p' "$TASKS_FILE")

# Count tasks (should be ### headings)
TASK_COUNT=$(echo "$NEXT_UP_SECTION" | grep -c "^### " || echo "0")

echo "📊 Found $TASK_COUNT tasks in 'Next Up' section"
echo ""

if [ $TASK_COUNT -eq 0 ]; then
  echo "⚠️  No tasks found in 'Next Up' section"
  echo "   This is fine if all work is complete, but verify intentional"
  echo ""
fi

# Check each task for required components
echo "🔎 Checking task format..."
echo ""

TASK_NUM=1
while [ $TASK_NUM -le $TASK_COUNT ]; do
  # Extract individual task section
  TASK_SECTION=$(echo "$NEXT_UP_SECTION" | sed -n "/^### $TASK_NUM\./,/^### \|^## /p")
  TASK_TITLE=$(echo "$TASK_SECTION" | grep "^### $TASK_NUM\." | sed "s/^### $TASK_NUM\. //")

  echo "Task $TASK_NUM: $TASK_TITLE"

  # Check for required sections
  HAS_PROBLEM=$(echo "$TASK_SECTION" | grep -c "^\*\*Problem:\*\*" || echo "0")
  HAS_IMPACT=$(echo "$TASK_SECTION" | grep -c "^\*\*Impact:\*\*" || echo "0")
  HAS_FILES=$(echo "$TASK_SECTION" | grep -c "^\*\*Files:\*\*" || echo "0")
  HAS_ACTION=$(echo "$TASK_SECTION" | grep -c "^\*\*Action:\*\*" || echo "0")
  HAS_SUCCESS=$(echo "$TASK_SECTION" | grep -c "^\*\*Success Criteria:\*\*" || echo "0")

  MISSING=""

  [ $HAS_PROBLEM -eq 0 ] && MISSING="$MISSING Problem"
  [ $HAS_IMPACT -eq 0 ] && MISSING="$MISSING Impact"
  [ $HAS_FILES -eq 0 ] && MISSING="$MISSING Files"
  [ $HAS_ACTION -eq 0 ] && MISSING="$MISSING Action"
  [ $HAS_SUCCESS -eq 0 ] && MISSING="$MISSING Success_Criteria"

  if [ -z "$MISSING" ]; then
    echo "   ✅ All required sections present"
  else
    echo "   ❌ Missing sections:$MISSING"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
  fi

  # Check for actionable content in Action section
  if [ $HAS_ACTION -eq 1 ]; then
    ACTION_STEPS=$(echo "$TASK_SECTION" | sed -n '/^\*\*Action:\*\*/,/^\*\*.*:\*\*/p' | grep -c "^[0-9]\+\." || echo "0")
    if [ $ACTION_STEPS -lt 2 ]; then
      echo "   ⚠️  Action section has fewer than 2 steps (may be too vague)"
    else
      echo "   ✅ Action section has $ACTION_STEPS numbered steps"
    fi
  fi

  echo ""
  TASK_NUM=$((TASK_NUM + 1))
done

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES_FOUND -eq 0 ]; then
  echo "✅ All tasks follow actionable format!"
  exit 0
else
  echo "⚠️  Found $ISSUES_FOUND task(s) with formatting issues"
  echo ""
  echo "💡 Task format template:"
  echo "   ### N. Task Title (PRIORITY)"
  echo "   **Problem:** ..."
  echo "   **Impact:** ..."
  echo "   **Files:** ..."
  echo "   **Action:** numbered steps"
  echo "   **Success Criteria:** ..."
  echo ""
  echo "See bottom of .claude/TASKS.md for full template"
  exit 1
fi

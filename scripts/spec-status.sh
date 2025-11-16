#!/bin/bash

# spec-status.sh - Generate spec status dashboard
# Part of Phase 1: Foundation automation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SPECS_DIR="$PROJECT_ROOT/.claude/specs"

echo "======================================================================"
echo "SPEC STATUS DASHBOARD"
echo "======================================================================"
echo ""

SPECS=("physics" "character" "decisions" "ui" "game-modes")

for spec in "${SPECS[@]}"; do
    echo "📊 $spec"
    echo "   ───────────────────────────────────────────────"

    # Check if spec directory exists
    if [ ! -d "$SPECS_DIR/$spec" ]; then
        echo "   ❌ Spec directory not found"
        echo ""
        continue
    fi

    # Check for SPEC.md or README.md
    if [ -f "$SPECS_DIR/$spec/SPEC.md" ]; then
        # Extract status from SPEC.md
        STATUS=$(grep -E "^\*\*Status:\*\*" "$SPECS_DIR/$spec/SPEC.md" | head -1 | sed 's/\*\*Status:\*\* //' || echo "Unknown")
        echo "   Status: $STATUS"
    elif [ -f "$SPECS_DIR/$spec/README.md" ]; then
        echo "   Status: Phase 1 - Templates Pending (README.md only)"
    else
        echo "   Status: Not initialized"
    fi

    # Check for TASKS.md and count tasks
    if [ -f "$SPECS_DIR/$spec/TASKS.md" ]; then
        # Count pending/in-progress/completed tasks
        PENDING=$(grep -c "^\- \[ \]" "$SPECS_DIR/$spec/TASKS.md" || echo "0")
        IN_PROGRESS=$(grep -c "status.*in_progress" "$SPECS_DIR/$spec/TASKS.md" || echo "0")
        COMPLETED=$(grep -c "^\- \[x\]" "$SPECS_DIR/$spec/TASKS.md" || echo "0")

        echo "   Tasks: $PENDING pending, $IN_PROGRESS in progress, $COMPLETED completed"

        # Check test status from TASKS.md
        TEST_STATUS=$(grep -E "^\*\*Test Status:\*\*" "$SPECS_DIR/$spec/TASKS.md" | head -1 | sed 's/\*\*Test Status:\*\* //' || echo "N/A")
        echo "   Tests: $TEST_STATUS"
    else
        echo "   Tasks: No TASKS.md (Phase 2 migration pending)"
    fi

    # Check for files present
    FILES_PRESENT=()
    for file in SPEC.md CONTRACTS.md PLANS.md DECISIONS.md TASKS.md EXAMPLES.md; do
        if [ -f "$SPECS_DIR/$spec/$file" ]; then
            FILES_PRESENT+=("$file")
        fi
    done

    if [ ${#FILES_PRESENT[@]} -gt 0 ]; then
        echo "   Files: ${FILES_PRESENT[*]}"
    else
        echo "   Files: README.md only (templates pending)"
    fi

    echo ""
done

# Overall summary
echo "======================================================================"
echo "OVERALL SUMMARY"
echo "======================================================================"

# Count total specs
TOTAL_SPECS=${#SPECS[@]}
echo "Total Specs: $TOTAL_SPECS"

# Count specs with SPEC.md
SPECS_WITH_SPEC=0
for spec in "${SPECS[@]}"; do
    if [ -f "$SPECS_DIR/$spec/SPEC.md" ]; then
        ((SPECS_WITH_SPEC++))
    fi
done
echo "Specs with SPEC.md: $SPECS_WITH_SPEC / $TOTAL_SPECS"

# Count specs with full structure (all 6 files)
FULL_STRUCTURE=0
for spec in "${SPECS[@]}"; do
    FILES_COUNT=0
    for file in SPEC.md CONTRACTS.md PLANS.md DECISIONS.md TASKS.md EXAMPLES.md; do
        if [ -f "$SPECS_DIR/$spec/$file" ]; then
            ((FILES_COUNT++))
        fi
    done
    if [ $FILES_COUNT -eq 6 ]; then
        ((FULL_STRUCTURE++))
    fi
done
echo "Specs with full structure: $FULL_STRUCTURE / $TOTAL_SPECS"

echo ""
echo "💡 TIP: Run 'npm run verify-specs' to validate spec structure"
echo "💡 TIP: Run 'npm run sync-contracts' to check contract synchronization"
echo ""

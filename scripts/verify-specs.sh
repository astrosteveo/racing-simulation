#!/bin/bash

# verify-specs.sh - Validate spec structure and completeness
# Part of Phase 1: Foundation automation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SPECS_DIR="$PROJECT_ROOT/.claude/specs"

echo "======================================================================"
echo "Spec Structure Verification"
echo "======================================================================"
echo ""

ERRORS=0
WARNINGS=0

# Check 1: Specs directory exists
echo "Check 1: Specs directory structure..."
if [ ! -d "$SPECS_DIR" ]; then
    echo "❌ ERROR: .claude/specs/ directory not found"
    ((ERRORS++))
else
    echo "✅ .claude/specs/ exists"
fi

# Check 2: INDEX.md exists
echo ""
echo "Check 2: INDEX.md exists..."
if [ ! -f "$SPECS_DIR/INDEX.md" ]; then
    echo "❌ ERROR: $SPECS_DIR/INDEX.md not found"
    ((ERRORS++))
else
    echo "✅ INDEX.md exists"
fi

# Check 3: All expected spec directories exist
echo ""
echo "Check 3: Spec directories..."
EXPECTED_SPECS=("physics" "character" "decisions" "ui" "game-modes")

for spec in "${EXPECTED_SPECS[@]}"; do
    if [ ! -d "$SPECS_DIR/$spec" ]; then
        echo "❌ ERROR: Spec directory missing: $spec"
        ((ERRORS++))
    else
        echo "✅ $spec/ exists"
    fi
done

# Check 4: Each spec has required files (Phase 1: at least README.md or SPEC.md)
echo ""
echo "Check 4: Required files per spec..."
for spec in "${EXPECTED_SPECS[@]}"; do
    if [ -d "$SPECS_DIR/$spec" ]; then
        echo "  Checking $spec..."

        # Phase 1: Check for at least README.md or SPEC.md
        if [ -f "$SPECS_DIR/$spec/README.md" ] || [ -f "$SPECS_DIR/$spec/SPEC.md" ]; then
            echo "    ✅ Has README.md or SPEC.md"
        else
            echo "    ⚠️  WARNING: No README.md or SPEC.md found"
            ((WARNINGS++))
        fi

        # Optional files (future phases)
        OPTIONAL_FILES=("CONTRACTS.md" "PLANS.md" "DECISIONS.md" "TASKS.md" "EXAMPLES.md")
        for file in "${OPTIONAL_FILES[@]}"; do
            if [ -f "$SPECS_DIR/$spec/$file" ]; then
                echo "    ✅ Has $file"
            fi
        done
    fi
done

# Check 5: No orphaned spec directories
echo ""
echo "Check 5: No orphaned spec directories..."
for dir in "$SPECS_DIR"/*/ ; do
    if [ -d "$dir" ]; then
        dirname=$(basename "$dir")
        if [[ ! " ${EXPECTED_SPECS[@]} " =~ " ${dirname} " ]]; then
            echo "⚠️  WARNING: Unexpected spec directory: $dirname"
            ((WARNINGS++))
        fi
    fi
done

# Check 6: INDEX.md lists all specs
echo ""
echo "Check 6: INDEX.md references all specs..."
if [ -f "$SPECS_DIR/INDEX.md" ]; then
    for spec in "${EXPECTED_SPECS[@]}"; do
        if grep -q "$spec/" "$SPECS_DIR/INDEX.md"; then
            echo "  ✅ $spec referenced in INDEX.md"
        else
            echo "  ⚠️  WARNING: $spec not mentioned in INDEX.md"
            ((WARNINGS++))
        fi
    done
fi

# Summary
echo ""
echo "======================================================================"
echo "Summary"
echo "======================================================================"
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ Spec verification FAILED ($ERRORS errors)"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  Spec verification passed with warnings ($WARNINGS warnings)"
    exit 0
else
    echo "✅ All spec structure checks passed!"
    exit 0
fi

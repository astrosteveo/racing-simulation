#!/bin/bash

# sync-contracts.sh - Check CONTRACTS.md vs src/types.ts synchronization
# Part of Phase 1: Foundation automation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SPECS_DIR="$PROJECT_ROOT/.claude/specs"
TYPES_FILE="$PROJECT_ROOT/src/types.ts"

echo "======================================================================"
echo "Contract Synchronization Check"
echo "======================================================================"
echo ""

ERRORS=0
WARNINGS=0

# Check 1: src/types.ts exists
echo "Check 1: src/types.ts exists..."
if [ ! -f "$TYPES_FILE" ]; then
    echo "❌ ERROR: $TYPES_FILE not found"
    ((ERRORS++))
    exit 1
else
    echo "✅ src/types.ts found"
fi

# Check 2: Extract interfaces from types.ts
echo ""
echo "Check 2: Extracting interfaces from src/types.ts..."
TYPES_INTERFACES=$(grep -E "^export interface" "$TYPES_FILE" | awk '{print $3}' | sort)
INTERFACE_COUNT=$(echo "$TYPES_INTERFACES" | wc -w)
echo "  Found $INTERFACE_COUNT interfaces in types.ts"

# Check 3: Check each spec's CONTRACTS.md
echo ""
echo "Check 3: Checking spec CONTRACTS.md files..."

SPECS=("physics" "character" "decisions" "ui" "game-modes")

for spec in "${SPECS[@]}"; do
    CONTRACTS_FILE="$SPECS_DIR/$spec/CONTRACTS.md"

    if [ -f "$CONTRACTS_FILE" ]; then
        echo ""
        echo "  Checking $spec/CONTRACTS.md..."

        # Extract documented interfaces from CONTRACTS.md
        # Looking for lines like: "### Interface: InterfaceName"
        DOCUMENTED_INTERFACES=$(grep -E "^### Interface:" "$CONTRACTS_FILE" | awk '{print $3}' | sort || true)

        if [ -z "$DOCUMENTED_INTERFACES" ]; then
            echo "    ⚠️  No interfaces documented (Phase 2 migration pending)"
            ((WARNINGS++))
        else
            # Check if documented interfaces exist in types.ts
            while IFS= read -r interface; do
                if echo "$TYPES_INTERFACES" | grep -q "$interface"; then
                    echo "    ✅ $interface: Documented and exists in types.ts"
                else
                    echo "    ❌ $interface: Documented but NOT in types.ts"
                    ((ERRORS++))
                fi
            done <<< "$DOCUMENTED_INTERFACES"
        fi

        # Check sync status in file
        if grep -q "⏳ Pending" "$CONTRACTS_FILE"; then
            echo "    ℹ️  Status: Pending (Phase 2 migration)"
        elif grep -q "✅ Synced" "$CONTRACTS_FILE"; then
            echo "    ✅ Status: Marked as synced"
        fi
    else
        echo "    ⚠️  No CONTRACTS.md found (Phase 2 migration pending)"
        ((WARNINGS++))
    fi
done

# Check 4: Suggest which interfaces belong to which specs (future enhancement)
echo ""
echo "Check 4: Interface distribution analysis..."
echo "  Total interfaces in types.ts: $INTERFACE_COUNT"
echo "  (Future: suggest which spec each interface belongs to)"

# Summary
echo ""
echo "======================================================================"
echo "Summary"
echo "======================================================================"
echo "Errors: $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ Contract sync check FAILED ($ERRORS errors)"
    echo ""
    echo "💡 Action required:"
    echo "   - Update CONTRACTS.md files to match types.ts"
    echo "   - Or update types.ts and remove outdated documentation"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "⚠️  Contract sync check passed with warnings ($WARNINGS warnings)"
    echo ""
    echo "ℹ️  Most warnings are expected during Phase 1 (migration pending)"
    exit 0
else
    echo "✅ All contracts synchronized!"
    exit 0
fi

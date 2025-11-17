# Spec Document Templates

**Purpose:** Ensure consistency across all specification documents
**Last Updated:** 2025-11-17

---

## Available Templates

| Template | Purpose | When to Use |
|----------|---------|-------------|
| `SPEC-TEMPLATE.md` | Main specification | Creating new spec/epic |
| `TASKS-TEMPLATE.md` | Task tracking | Every spec needs one |
| `CONTRACTS-TEMPLATE.md` | Interface documentation | When spec defines interfaces/APIs |
| `PLANS-TEMPLATE.md` | Roadmap and milestones | Long-term planning for spec |
| `EXAMPLES-TEMPLATE.md` | Test scenarios and validation | When spec needs calibration data |
| `REFERENCE-TEMPLATE.md` | Domain knowledge | When spec needs background info |

---

## How to Use Templates

### Creating a New Spec

1. **Create spec directory:**
   ```bash
   mkdir -p .claude/specs/my-new-spec
   ```

2. **Copy required templates:**
   ```bash
   cp .claude/templates/SPEC-TEMPLATE.md .claude/specs/my-new-spec/SPEC.md
   cp .claude/templates/TASKS-TEMPLATE.md .claude/specs/my-new-spec/TASKS.md
   ```

3. **Fill in the template:**
   - Replace `[Spec Name]` with your spec name
   - Replace `[Brief Description]` with your description
   - Fill in all `TODO:` sections
   - Remove sections that don't apply (mark N/A if keeping structure)

4. **Optional templates** (copy if needed):
   - `CONTRACTS-TEMPLATE.md` - If defining interfaces
   - `PLANS-TEMPLATE.md` - If long-term roadmap needed
   - `EXAMPLES-TEMPLATE.md` - If calibration/validation data needed
   - `REFERENCE-TEMPLATE.md` - If domain knowledge needed

5. **Update INDEX.md:**
   - Add your new spec to `.claude/specs/INDEX.md`

---

## Template Sections

Each template has standard sections. **Do not remove sections** - mark as "N/A" or "TBD" if not applicable yet.

### Required Sections (All Templates)

- **Header** - Version, Status, Last Updated
- **Overview** - Purpose and scope
- **Body** - Template-specific content
- **Footer** - Maintenance info

### Template-Specific Sections

**TASKS-TEMPLATE.md:**
- **TDD Breakdown** - Each task should include test-first cycle breakdown:
  1. Write test → Run (RED) → Implement → Run (GREEN) → Commit
  2. Repeat for each feature unit
  3. Refactor → Commit
- **Success Criteria** - Must include test-first requirement
- Ensures TDD discipline built into every task

See each template for its specific required sections.

---

## Creating New Template Types

When you need a new document type not covered by existing templates:

1. **Check if really needed** - Can existing template be adapted?
2. **Create template first:**
   ```bash
   touch .claude/templates/NEWTYPE-TEMPLATE.md
   ```
3. **Define structure:**
   - Standard header (Version, Status, Last Updated)
   - Clear sections with `TODO:` placeholders
   - Usage examples
   - Footer
4. **Update this README:**
   - Add to table above
   - Add usage instructions
5. **Update CONSTITUTION.md:**
   - Add to "Template System Reference" if workflow changes
6. **Then create actual document** from new template

---

## Template Maintenance

**Templates are living documents:**
- Update when patterns emerge
- Refine based on usage
- Version changes
- Keep in sync with actual docs

**When updating templates:**
1. Update template file
2. Update this README if usage changes
3. Consider if existing docs need updates
4. Document change in commit message

---

## Examples

### Good Use
```
# Creating game-modes spec (if it didn't exist)
cp .claude/templates/SPEC-TEMPLATE.md .claude/specs/game-modes/SPEC.md
cp .claude/templates/TASKS-TEMPLATE.md .claude/specs/game-modes/TASKS.md
cp .claude/templates/EXAMPLES-TEMPLATE.md .claude/specs/game-modes/EXAMPLES.md
# Fill in templates...
```

### Bad Use
```
# DON'T create documents from scratch without template
touch .claude/specs/my-spec/SPEC.md  # ❌ No! Use template!
```

---

## Validation

Future scripts will validate:
- All specs have required SPEC.md and TASKS.md
- Documents follow template structure
- Required sections present

---

**Last Updated:** 2025-11-17
**Template Version:** 1.0

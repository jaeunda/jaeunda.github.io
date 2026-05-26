# Agent Instructions

## Shared Skills

All repository-local skills live under `.agent/skills`.

When an agent needs a skill, read the matching `SKILL.md` from:

```text
.agent/skills/<skill-name>/SKILL.md
```

Do not keep separate skill copies in agent-specific directories. Agent-specific
directories may expose compatibility links or small launcher metadata, but the
skill body should stay in `.agent/skills`.

Current shared skills:

- `design-system`: `.agent/skills/design-system/SKILL.md`
- `github-workflow`: `.agent/skills/github-workflow/SKILL.md`

## Validation

When wrapping a change with the `github-workflow` skill, run the validation
commands declared by that skill before committing non-trivial work.

## Design System Maintenance

When a design change intentionally updates colors, typography, layout, component
styling, or interactions, update
`.agent/skills/design-system/references/design-system.md` in the same change and
add a Design Decisions Log entry explaining why.

## Compatibility Paths

- Claude-compatible skill paths under `.claude/skills` should symlink to the
  corresponding shared skill in `.agent/skills`.
- OpenAI Agent metadata can live beside the shared skill under
  `.agent/skills/<skill-name>/agents`.
- Runtime-mounted directories such as `.agents` or `.codex` may be read-only in
  some environments; do not use them as the source of truth for repository
  skills.

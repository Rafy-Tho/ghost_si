<!-- BEGIN:project-agent-rules -->

# Project Stack

This project targets a React + Vite frontend, a Node.js + Express API, Prisma + PostgreSQL, Clerk, Liveblocks, Trigger.dev, and Vercel Blob. Some integrations are not implemented yet; check the progress tracker before assuming they are available. Do not add Next.js-specific conventions or dependencies.

<!-- END:project-agent-rules -->

## Application Building Context

Read the following files in order before implementing or making any architectural decision:

1. `context/01_project-overview.md` — product definition, goals, features, and scope
2. `context/02_architecture-context.md` — system structure, boundaries, storage model, and invariants
3. `context/03_ui-context.md` — theme, colors, typography, canvas design, and component conventions
4. `context/04_code-standards.md` — implementation rules and conventions
5. `context/05_ai-workflow-rules.md` — development workflow, scoping rules, and delivery approach
6. `context/07-security-plan.md` — security requirements, threat model, and verification gates
7. `context/06_progress-tracker.md` — current phase, completed work, open questions, and next steps

For feature work, also read the relevant specification under `context/feature_specs/` and any supporting architecture documentation before editing.

Update `context/06_progress-tracker.md` after each meaningful implementation change.

If implementation changes the architecture, scope, security decisions, or standards documented in the context files, update the relevant file before continuing.

Before completing a change, run the smallest relevant build, test, or validation command and record the result in the progress tracker.

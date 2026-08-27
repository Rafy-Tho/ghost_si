Read `AGENTS.md` and `context/03_ui-context.md` before starting.

We're adding the design system and UI primitive components.

Install and configure `shadcn/ui` inside `apps/web`.

Add these shadcn components:

- Button
- Card
- Dialog
- Input
- Tabs
- Textarea
- ScrollArea

Do not modify the generated `components/ui/*` files after installation.

Also Install `lucide-react`.

Create `apps/web/src/lib/utils.js` with a reusable `cn()` helper for merging Tailwind classes.

Ensure all components match the existing dark theme in `globals.css`.

### Check when done

- All components import without errors
- `cn()` works properly
- No default light styling appears

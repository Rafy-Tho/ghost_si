# Ghost AI Stitch Prompt

```text
Design a high-fidelity responsive SaaS web application called “Ghost AI”.

Ghost AI is a real-time collaborative system design workspace. Users create architecture projects, import starter system designs, describe systems in natural language, collaborate on a shared React Flow canvas, use AI to generate architecture nodes and edges, and generate a downloadable Markdown technical specification.

Create a cohesive product experience, not a generic admin dashboard.

VISUAL DIRECTION

Use a dark-only developer-tool aesthetic inspired by premium products such as Linear, Raycast, Figma, and modern AI workspaces.

Use these design tokens:

- Page background: #080809
- Surface: #111114
- Elevated surface: #18181c
- Subtle surface: #1e1e23
- Borders: #2a2a30 and #3a3a42
- Primary text: #f0f0f4
- Secondary text: #c0c0cc
- Muted text: #808090
- Brand cyan: #00c8d4
- AI indigo-purple: #6457f9
- AI text: #8b82ff
- Error: #ff4d4f
- Success: #34d399
- Warning: #fbbf24

Use Geist Sans for interface text and Geist Mono for code, IDs, system labels, and Markdown previews.

Use thin borders, layered surfaces, subtle background contrast, and restrained shadows. Avoid gradients, excessive glow, oversized hero sections, unnecessary cards, and bright white backgrounds.

Use Lucide-style outline icons. Use rounded-xl for small controls, rounded-2xl for panels, and rounded-3xl for dialogs.

PRIMARY EDITOR WORKSPACE

Make the editor the main product experience.

Use a full-viewport layout:

- Fixed top navbar approximately 56px high
- Desktop project sidebar in its own column on the left, beside the canvas
- Large central architecture canvas
- Slide-over AI assistant panel on the right
- Responsive mobile layout that converts sidebars into drawers or sheets

Navbar:

- Ghost AI logo and wordmark
- Current project name
- Save status such as “Saved 12 seconds ago”
- Collaborator avatar stack
- Share button
- Generate spec button
- User profile button
- Sidebar toggle button

Left project sidebar:

- Header labeled “Projects”
- Tabs: “My Projects” and “Shared”
- Search projects input
- Project list with project name, last edited time, and collaborator count
- Empty state for projects
- Full-width “New Project” button at the bottom
- On desktop, let the sidebar push the canvas area instead of covering it; on mobile, convert it into a drawer with a scrim

Architecture canvas:

- Near-black canvas background
- Subtle React Flow grid
- Smooth-step connecting edges with arrow markers
- Small zoom controls and minimap
- Toolbar for select, node, edge, undo, redo, fit view, and save
- Architecture nodes with six supported shapes: rectangle, diamond, circle, pill, cylinder, and hexagon
- Use visually distinct node colors for services, databases, events, external systems, and decisions
- Show a realistic sample architecture containing API Gateway, Web App, Auth Service, PostgreSQL, Redis, Message Queue, Worker, Object Storage, and External Payment Provider
- Make the canvas feel like an active collaborative workspace rather than a static diagram
- Show two or three collaborator cursors with names and accent colors
- Include selected-node states, hover handles, connection states, and empty-canvas states

RIGHT AI ASSISTANT PANEL

Create a polished AI assistant slide-over panel with an indigo-purple accent.

Include:

- Header: “Ghost AI”
- Context label showing the current project
- Prompt textarea with placeholder: “Describe the system you want to design...”
- Primary button: “Generate architecture”
- Secondary action: “Extend current design”
- Example prompt chips: “Design a video streaming platform”, “Add event-driven processing”, and “Scale the notification service”
- Task status states: idle, generating, completed, and failed
- Loading state with structured progress messages
- Generated result summary
- Buttons for “Apply to canvas” and “Discard”
- Small disclaimer that AI suggestions can be reviewed and edited
- Keyboard shortcut hint for submitting the prompt

PROJECT DASHBOARD

Create a project management screen using the same shell and visual language.

Include:

- Page title: “Projects”
- “New Project” primary button
- Search and filter controls
- Sections for “My Projects” and “Shared with me”
- Project cards or compact rows showing project name, updated time, canvas status, and collaborators
- Empty state with a technical architecture illustration
- New project dialog with project name and optional description
- Clear loading, error, and no-results states

STARTER TEMPLATE EXPERIENCE

Create a template picker dialog or sheet.

Include templates for:

- Monolith
- Microservices
- Event-driven system
- Serverless application
- Real-time collaboration system
- E-commerce platform

Each template should show a miniature architecture preview, title, short description, and “Import template” action.

The import experience should make clear that the template will be added to the active shared canvas.

COLLABORATORS EXPERIENCE

Create a share/collaborators dialog.

Include:

- Project owner section
- Current collaborators list
- Add collaborator input using an email address for an existing Clerk user
- “Add collaborator” action
- Remove collaborator action
- Permission label limited to “Owner” and “Collaborator”
- Clear success and error feedback

Do not design email invitations, invitation tokens, billing, teams, enterprise roles, or advanced permission tiers.

SPECIFICATION EXPERIENCE

Create a specification preview panel or page.

Include:

- Header: “Technical specification”
- Project name and generation timestamp
- Markdown-style document preview with headings, code blocks, tables, and architecture sections
- Generation status indicator
- “Generate specification” button
- “Download Markdown” button
- Empty state before the first specification is generated
- Error and retry states
- Keep only the current specification visible in the MVP

AUTHENTICATION SCREENS

Create matching sign-in and sign-up screens.

Desktop:

- Two-panel layout
- Left side with Ghost AI branding and a subtle architecture canvas visual
- Right side with the authentication form

Mobile:

- Form-focused single-column layout
- Compact Ghost AI logo
- Dark theme
- Clear loading, validation, and error states

RESPONSIVE BEHAVIOR

Design desktop views at approximately 1440x1000 and mobile views at approximately 390x844.

On smaller screens:

- Convert the project sidebar into a drawer
- Convert the AI panel into a full-height sheet
- Keep canvas controls accessible
- Move secondary actions into an overflow menu
- Preserve readable project and specification layouts
- Do not simply shrink the desktop layout

ACCESSIBILITY AND STATES

Every interactive control must include:

- Hover state
- Focus-visible state
- Active state
- Disabled state
- Loading state where applicable
- Helpful tooltip for unfamiliar icon-only actions

Use strong contrast, clear keyboard focus indicators, semantic labels, and accessible dialogs.

FINAL QUALITY BAR

The result should feel like a premium production-ready developer tool for system architects. Prioritize the collaborative editor workspace and architecture canvas. Keep the interface dense, intentional, technical, and visually calm. Do not make it look like a generic project management dashboard or marketing landing page.
```

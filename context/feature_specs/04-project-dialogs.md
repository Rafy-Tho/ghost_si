# Project Dialogs & Editor Home

## Goal

Build the `/editor` home screen and add project dialogs/sidebar actions using mock data only. No API calls, persistence, project detail screen, or project navigation yet.

## Sidebar Layout

On desktop, the project sidebar occupies its own column beside the editor workspace and opening it pushes the workspace area horizontally instead of covering it. On mobile, it remains a slide-in drawer with a backdrop scrim. `My Projects` and `Shared` remain tabs inside the sidebar, with the tab controls displayed directly above the selected project list. The selected tab must have a clear active visual state and tapping a tab must switch the displayed list.

Project rows are display-only for this feature. Clicking a project must not navigate to a project detail screen or change the editor workspace yet.

## Editor Home

Reuse the existing editor layout and navbar. Keep the sidebar responsive behavior described above.

In the center of the page, add:

- heading: `Create a project`
- description: `Start a new architecture workspace to begin designing your system.`
- `New Project` button with a `Plus` icon

Replace the existing center empty state with this content. Keep the layout minimal and do not wrap it in a card or bordered container.

Clicking `New Project` should open the Create Project dialog.

## Dialogs

### Create Project

- required project name input
- live slug preview based on the name
- preview updates as the user types
- slug preview is read-only
- trim the name before creating the mock project
- disable submission when the name is empty or invalid
- on submit, add the project to the mock `My Projects` list and close the dialog
- do not navigate to a project detail screen after creation

Use this mock project shape:

```js
{
  id: "project-1",
  name: "Payments Platform",
  slug: "payments-platform",
  access: "owner",
}
```

Slug generation should lowercase the name, replace spaces and punctuation with hyphens, collapse repeated hyphens, and remove leading or trailing hyphens. Use `untitled-project` for an empty preview.

### Rename Project

- prefilled project name input
- current project name shown in the description
- input auto-focuses
- Enter submits
- name is required after trimming
- on submit, update the project in the mock list and close the dialog
- do not change the project slug or navigate anywhere

### Delete Project

- destructive confirmation only
- no input
- confirm button uses destructive styling
- confirmation includes the project name
- on confirm, remove the project from the mock list and close the dialog

## Sidebar

Add project item actions:

- rename
- delete

Use mock project data with an explicit `access` value of `owner` or `collaborator`. Seed at least one project in each tab so both ownership states can be verified.

Show actions only for owned projects.

Hide actions for shared/collaborator projects.

Project rows must not be links and must not implement project opening yet. Owned project actions should be available through an accessible action menu or equivalent controls. Shared projects should have no rename or delete controls.

Opening Create, Rename, or Delete from the sidebar must leave the sidebar open. Closing the dialog returns the user to the same sidebar state.

On mobile:

- tapping outside the sidebar closes it
- add a backdrop scrim
- pressing Escape closes the sidebar
- return focus to the sidebar toggle after closing

## Implementation

Create a dedicated hook to manage:

- dialog state
- form state
- validation state
- loading/submitting state

The hook should expose handlers for opening and closing each dialog and for applying the mock create, rename, and delete changes. Reset form values when a dialog closes or a different project action opens.

Wire:

- editor home `New Project` → Create dialog
- sidebar create → Create dialog
- sidebar rename → Rename dialog
- sidebar delete → Delete dialog

Use mock project data only. Do not add API calls, persistence, project detail routes, or active-project navigation.

## Check When Done

- sidebar actions are wired
- slug preview works
- selected project tab has a clear active state and switches its list
- owned projects show rename/delete actions
- shared projects hide rename/delete actions
- create, rename, and delete update the mock list
- mobile sidebar scrim and outside-click behavior work
- `npm run build:web` passes

import { UserButton } from "@clerk/react";
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand/brand-mark.jsx";

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  sidebarToggleRef,
}) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const sidebarLabel = isSidebarOpen ? "Close project sidebar" : "Open project sidebar";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center border-b border-surface-border bg-surface/95 px-3 backdrop-blur-sm sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Button
          aria-controls="project-sidebar"
          aria-expanded={isSidebarOpen}
          aria-label={sidebarLabel}
          className="rounded-xl text-copy-secondary hover:bg-subtle hover:text-copy-primary"
          onClick={onToggleSidebar}
          ref={sidebarToggleRef}
          size="icon"
          title={sidebarLabel}
          variant="ghost"
        >
          <SidebarIcon aria-hidden="true" className="size-5" />
        </Button>
        <BrandMark className="hidden sm:flex" />
        <div className="hidden min-w-0 items-center gap-1.5 md:flex">
          <ChevronRight aria-hidden="true" className="size-4 text-copy-faint" />
          <span className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-copy-muted">
            {projectName ?? "Untitled architecture"}
          </span>
        </div>
      </div>
      <div className="hidden flex-1 items-center justify-center sm:flex">
        <div className="flex items-center gap-2 rounded-xl border border-surface-border bg-elevated/60 px-3 py-1.5">
          <span className="size-1.5 rounded-full bg-success" />
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-copy-muted">
            Workspace online
          </span>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-copy-faint lg:inline">
          Draft / local
        </span>
        <UserButton />
      </div>
    </nav>
  );
}

import { UserButton } from "@clerk/react";
import {
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand/brand-mark.jsx";

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  isAiSidebarOpen,
  onToggleAiSidebar,
  aiSidebarToggleRef,
  projectName,
  onOpenShare,
  shareButtonRef,
  sidebarToggleRef,
}) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const sidebarLabel = isSidebarOpen ? "Close project sidebar" : "Open project sidebar";
  const AiSidebarIcon = isAiSidebarOpen ? PanelRightClose : PanelRightOpen;
  const aiSidebarLabel = isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar";
  const shareLabel = onOpenShare ? "Share project" : "Open a project to share it";

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
        <Button
          aria-label={shareLabel}
          className="rounded-xl"
          disabled={!onOpenShare}
          onClick={onOpenShare}
          ref={shareButtonRef}
          size="sm"
          title={shareLabel}
          type="button"
          variant="outline"
        >
          <Share2 aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Share</span>
        </Button>
        <Button
          aria-controls="ai-sidebar"
          aria-expanded={isAiSidebarOpen}
          aria-label={aiSidebarLabel}
          className="rounded-xl text-copy-secondary hover:bg-subtle hover:text-copy-primary"
          onClick={onToggleAiSidebar}
          ref={aiSidebarToggleRef}
          size="icon"
          title={aiSidebarLabel}
          type="button"
          variant="ghost"
        >
          <AiSidebarIcon aria-hidden="true" className="size-5" />
        </Button>
        <UserButton />
      </div>
    </nav>
  );
}

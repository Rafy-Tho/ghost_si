import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EditorNavbar({ isSidebarOpen, onToggleSidebar }) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;
  const sidebarLabel = isSidebarOpen ? "Close project sidebar" : "Open project sidebar";

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-14 items-center border-b border-surface-border bg-surface/95 px-3 backdrop-blur-sm">
      <div className="flex min-w-0 flex-1 items-center">
        <Button
          aria-controls="project-sidebar"
          aria-expanded={isSidebarOpen}
          aria-label={sidebarLabel}
          className="rounded-xl text-copy-secondary hover:bg-subtle hover:text-copy-primary"
          onClick={onToggleSidebar}
          size="icon"
          variant="ghost"
        >
          <SidebarIcon aria-hidden="true" className="size-5" />
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 items-center justify-end" aria-hidden="true" />
    </nav>
  );
}

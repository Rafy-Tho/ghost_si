import { Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AiSidebarPlaceholder({ isOpen, onClose }) {
  return (
    <aside
      aria-hidden={!isOpen}
      aria-label="AI assistant"
      className={`invisible fixed top-20 right-4 bottom-4 z-40 flex w-[min(24rem,calc(100vw-2rem))] translate-x-[calc(100%+1rem)] flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface/95 shadow-2xl backdrop-blur-sm transition-[transform,visibility] duration-200 ${isOpen ? "visible translate-x-0" : ""} lg:top-16 lg:right-0 lg:bottom-0 lg:w-96 lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:bg-surface lg:shadow-none`}
      id="ai-sidebar"
      inert={!isOpen ? "" : undefined}
    >
      <div className="flex items-start justify-between border-b border-surface-border px-4 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ai-text">
            AI workspace
          </p>
          <h2 className="mt-1 text-sm font-semibold text-copy-primary">
            Architecture copilot
          </h2>
        </div>
        <Button
          aria-label="Close AI sidebar"
          className="rounded-xl text-copy-muted hover:bg-subtle hover:text-copy-primary"
          onClick={onClose}
          size="icon-sm"
          title="Close AI sidebar"
          type="button"
          variant="ghost"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="grid size-12 place-items-center rounded-2xl border border-ai/30 bg-ai/10 text-ai-text">
          <Bot aria-hidden="true" className="size-5" />
        </span>
        <h3 className="mt-5 text-lg font-semibold tracking-tight text-copy-primary">
          AI chat is next
        </h3>
        <p className="mt-3 max-w-xs text-sm leading-6 text-copy-muted">
          Prompt-driven architecture generation will be connected here in a future workspace update.
        </p>
      </div>
    </aside>
  );
}

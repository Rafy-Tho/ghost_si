import { Ghost } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className, compact = false }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-brand/30 bg-accent-dim text-brand">
        <Ghost aria-hidden="true" className="size-4" />
      </span>
      {!compact ? (
        <span className="text-sm font-semibold tracking-tight text-copy-primary">
          Ghost <span className="text-brand">AI</span>
        </span>
      ) : null}
    </div>
  );
}

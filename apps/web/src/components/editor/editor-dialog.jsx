import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function EditorDialog({
  children,
  description,
  footer,
  contentClassName,
  title,
  ...dialogProps
}) {
  return (
    <Dialog {...dialogProps}>
      <DialogContent
        className={cn(
          "rounded-3xl border border-surface-border bg-surface text-copy-primary shadow-2xl",
          contentClassName,
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-copy-muted">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        {children}
        {footer ? (
          <DialogFooter className="rounded-b-3xl border-surface-border bg-elevated/50">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

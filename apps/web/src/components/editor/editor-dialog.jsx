import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EditorDialog({
  children,
  description,
  footer,
  title,
  ...dialogProps
}) {
  return (
    <Dialog {...dialogProps}>
      <DialogContent className="rounded-3xl border border-surface-border bg-surface text-copy-primary shadow-2xl">
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

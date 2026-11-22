import { Icon } from "@/components/ui/icon";

export function DemoStoreNotice() {
  return (
    <div
      role="note"
      className="flex items-start gap-2.5 rounded-md bg-destructive px-3 py-2.5 text-sm text-destructive-foreground"
    >
      <Icon name="triangle-alert" className="size-4 shrink-0" />
      <div className="grid gap-0.5">
        <p className="font-medium">This is a demo store</p>
        <p>Orders are never shipped, and you won&apos;t receive any prints.</p>
      </div>
    </div>
  );
}

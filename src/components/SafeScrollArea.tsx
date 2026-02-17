import { PropsWithChildren } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SafeScrollArea({
  offset = 320,
  className,
  children,
}: PropsWithChildren<{ offset?: number; className?: string }>) {
  return (
    <ScrollArea
      className={className}
      style={{
        maxHeight: `calc(100dvh - var(--safe-top) - var(--safe-bottom) - var(--bottom-bar) - ${offset}px)`,
      }}
    >
      {children}
    </ScrollArea>
  );
}

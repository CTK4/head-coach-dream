import { Drawer, DrawerContent } from "@/components/ui/drawer";
import type { ReactNode } from "react";

export function BottomSheet({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] px-4 pt-3 pb-6 overflow-y-auto">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
        {children}
      </DrawerContent>
    </Drawer>
  );
}

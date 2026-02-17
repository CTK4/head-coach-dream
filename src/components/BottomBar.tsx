import { PropsWithChildren, useEffect } from "react";
import { PHONE_MAX_W } from "@/config/ui";

export default function BottomBar({ children }: PropsWithChildren) {
  useEffect(() => {
    document.documentElement.style.setProperty("--bottom-bar", "72px");
    return () => document.documentElement.style.setProperty("--bottom-bar", "0px");
  }, []);

  return (
    <div className="fixed left-0 right-0 bottom-0 mx-auto w-full" style={{ maxWidth: PHONE_MAX_W }}>
      <div
        className="border-t bg-background/95 backdrop-blur px-4 pt-3"
        style={{ paddingBottom: "calc(12px + var(--safe-bottom))" }}
      >
        {children}
      </div>
    </div>
  );
}

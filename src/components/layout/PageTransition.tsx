import type { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  type?: "fade" | "slide-up" | "slide-right";
}

export default function PageTransition({ children, type = "fade" }: PageTransitionProps) {
  const cls = type === "slide-up" ? "animate-in slide-in-from-bottom-3 duration-150" : type === "slide-right" ? "animate-in slide-in-from-right-3 duration-150" : "animate-in fade-in duration-150";
  return <div className={cls}>{children}</div>;
}

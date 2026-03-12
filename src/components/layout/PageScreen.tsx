import { cn } from "@/lib/utils";

interface PageScreenProps {
  children: React.ReactNode;
  className?: string;
}

export function PageScreen({ children, className }: PageScreenProps) {
  return (
    <div className={cn("min-h-screen bg-surface-0 pb-20", className)}>
      {children}
    </div>
  );
}

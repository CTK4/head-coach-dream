import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  backPath?: string;
  showBack?: boolean;
  className?: string;
}

export function ScreenHeader({ title, subtitle, rightAction, backPath, showBack = false, className }: ScreenHeaderProps) {
  const navigate = useNavigate();
  const goBack = useCallback(() => {
    if (backPath) {
      navigate(backPath);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/hub");
  }, [backPath, navigate]);

  return (
    <div className={cn("sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-md", className)}>
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            onClick={goBack}
            className="rounded-full p-1 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-100" />
          </button>
        ) : null}
        <div>
          <h1 className="text-lg font-bold leading-none text-slate-100">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {rightAction && <div>{rightAction}</div>}
    </div>
  );
}

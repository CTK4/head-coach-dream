import type { ButtonHTMLAttributes } from "react";
import { Settings } from "lucide-react";
import { usePressFeedback } from "@/hooks/usePressFeedback";
import { cn } from "@/lib/utils";
import "./pressable.css";

type PressableVariant = "primary" | "secondary" | "icon";

type PressableButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  variant?: PressableVariant;
};

export function PressableButton({
  className,
  children,
  disabled,
  variant = "primary",
  ...props
}: PressableButtonProps) {
  const { buttonProps } = usePressFeedback<HTMLButtonElement>({ disabled });

  return (
    <button
      {...props}
      {...buttonProps}
      disabled={disabled}
      type="button"
      className={cn("pressable-button", `pressable-button--${variant}`, className)}
    >
      {children}
    </button>
  );
}

export function PressableButtonDemo() {
  const handleAction = () => undefined;

  return (
    <div className="pressable-demo" aria-label="Press feedback demo">
      <PressableButton variant="primary" onClick={handleAction}>Continue</PressableButton>
      <PressableButton variant="secondary" onClick={handleAction}>Cancel</PressableButton>
      <PressableButton variant="icon" aria-label="Settings" onClick={handleAction}>
        <Settings aria-hidden="true" size={18} />
      </PressableButton>
    </div>
  );
}

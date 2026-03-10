import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent, PointerEvent } from "react";
import { triggerHapticTap } from "@/lib/haptics";

type PressableElement = HTMLElement;

type UsePressFeedbackOptions = {
  disabled?: boolean;
  cancelOnDragOut?: boolean;
};

type PressFeedbackButtonProps<T extends PressableElement> = {
  ref: (node: T | null) => void;
  "data-pressed": "true" | "false";
  onPointerDown: (event: PointerEvent<T>) => void;
  onPointerUp: (event: PointerEvent<T>) => void;
  onPointerCancel: (event: PointerEvent<T>) => void;
  onPointerLeave: (event: PointerEvent<T>) => void;
  onLostPointerCapture: (event: PointerEvent<T>) => void;
  onClickCapture: (event: MouseEvent<T>) => void;
};

type UsePressFeedbackResult<T extends PressableElement> = {
  pressed: boolean;
  buttonProps: PressFeedbackButtonProps<T>;
};

function isPointInsideElement(target: HTMLElement, x: number, y: number): boolean {
  const rect = target.getBoundingClientRect();
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

export function usePressFeedback<T extends PressableElement = HTMLButtonElement>(
  options: UsePressFeedbackOptions = {},
): UsePressFeedbackResult<T> {
  const { disabled = false, cancelOnDragOut = true } = options;
  const [pressed, setPressed] = useState(false);
  const elementRef = useRef<T | null>(null);
  const activePointerIdRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);

  const clearPress = useCallback(() => {
    setPressed(false);
    activePointerIdRef.current = null;
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        clearPress();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearPress]);

  const onPointerDown = useCallback(
    (event: PointerEvent<T>) => {
      if (disabled || event.button !== 0) {
        return;
      }

      const element = event.currentTarget;
      elementRef.current = element;
      activePointerIdRef.current = event.pointerId;
      suppressClickRef.current = false;
  
      setPressed(true);
      element.setPointerCapture(event.pointerId);

      if (event.pointerType === "touch" || event.pointerType === "pen") {
        triggerHapticTap(event.pointerId);
      }
    },
    [disabled],
  );

  const onPointerUp = useCallback(
    (event: PointerEvent<T>) => {
      if (disabled) {
        return;
      }

      const element = elementRef.current;
      const isActivePointer = activePointerIdRef.current === event.pointerId;
      if (!element || !isActivePointer) {
        clearPress();
        return;
      }

      const releasedInside = isPointInsideElement(element, event.clientX, event.clientY);
      if (cancelOnDragOut && !releasedInside) {
        suppressClickRef.current = true;
        event.preventDefault();
        event.stopPropagation();
      }

      clearPress();
    },
    [cancelOnDragOut, clearPress, disabled],
  );

  const onPointerCancel = useCallback(() => {
    clearPress();
  }, [clearPress]);

  const onPointerLeave = useCallback(
    (event: PointerEvent<T>) => {
      const element = event.currentTarget;
      if (!element.hasPointerCapture(event.pointerId)) {
        clearPress();
      }
    },
    [clearPress],
  );

  const onLostPointerCapture = useCallback(() => {
    clearPress();
  }, [clearPress]);

  const onClickCapture = useCallback((event: MouseEvent<T>) => {
    if (!suppressClickRef.current) {
      return;
    }

    suppressClickRef.current = false;
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const ref = useCallback((node: T | null) => {
    elementRef.current = node;
  }, []);

  const buttonProps = useMemo(
    () => ({
      ref,
      "data-pressed": pressed ? ("true" as const) : ("false" as const),
      onPointerDown,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
      onLostPointerCapture,
      onClickCapture,
    }),
    [onClickCapture, onLostPointerCapture, onPointerCancel, onPointerDown, onPointerLeave, onPointerUp, pressed, ref],
  );

  return { pressed, buttonProps };
}

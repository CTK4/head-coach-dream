import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import {
  PHONE_MAX_W,
  envCompactEnabled,
  envPhoneLayoutEnabled,
  getDensityOverride,
  getPhoneFrameOverride,
  isLikelyPhone,
  type DensityMode,
} from "@/config/ui";

export default function AppShell({ children }: PropsWithChildren) {
  const [phone, setPhone] = useState(false);
  const [override, setOverride] = useState<boolean | null>(null);
  const [densityOverride, setDensityOverrideState] = useState<DensityMode>("auto");

  useEffect(() => {
    const mql = window.matchMedia?.("(max-width: 480px)");
    const update = () => setPhone(isLikelyPhone());
    update();

    if (!mql) return;
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    setOverride(getPhoneFrameOverride());
    setDensityOverrideState(getDensityOverride());

    const onStorage = (e: StorageEvent) => {
      if (e.key === "ui:phoneFrame") setOverride(getPhoneFrameOverride());
      if (e.key === "ui:density") setDensityOverrideState(getDensityOverride());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const constrain = useMemo(() => {
    if (override !== null) return override;
    return phone || envPhoneLayoutEnabled();
  }, [override, phone]);

  const densityAttr = useMemo(() => {
    if (densityOverride === "compact") return "compact";
    if (densityOverride === "comfortable") return "comfortable";
    if (phone) return "compact";
    return envCompactEnabled() ? "compact" : "comfortable";
  }, [densityOverride, phone]);

  return (
    <div className="min-h-[100dvh] bg-background" data-density={densityAttr}>
      <div
        className={`mx-auto w-full min-h-[100dvh] ${constrain ? "border-x" : ""}`}
        style={{
          maxWidth: constrain ? `${PHONE_MAX_W}px` : undefined,
          paddingTop: "var(--safe-top)",
          paddingLeft: "var(--safe-left)",
          paddingRight: "var(--safe-right)",
          paddingBottom: "calc(var(--safe-bottom) + var(--bottom-bar))",
        }}
      >
        {children}
      </div>
    </div>
  );
}

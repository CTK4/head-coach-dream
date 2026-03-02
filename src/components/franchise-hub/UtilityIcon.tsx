import { useState } from "react";

type UtilityIconName =
  | "Calendar"
  | "Cold"
  | "Fatigued"
  | "High_Motor"
  | "Hot"
  | "IQ"
  | "Injured_Reserved"
  | "Issue"
  | "Lazy"
  | "Messages"
  | "Rested"
  | "Settings"
  | "Tag";

export function UtilityIcon({
  name,
  alt,
  className = "h-4 w-4",
}: {
  name: UtilityIconName;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        aria-label={alt ?? name}
        className={`${className} inline-block rounded-sm border border-slate-300/20 bg-slate-950/30`}
      />
    );
  }

  const src = `/utility/${name}.png`;

  return (
    <img
      src={src}
      alt={alt ?? name}
      className={`${className} object-contain`}
      loading="eager"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

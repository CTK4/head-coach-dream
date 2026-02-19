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
  const src = `/utility/${encodeURIComponent(name)}.png`;
  return <img src={src} alt={alt ?? name} className={className} loading="eager" decoding="async" />;
}

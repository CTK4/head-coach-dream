import { useMemo, useState, type ImgHTMLAttributes } from "react";
import { buildR2Url, type AssetKind } from "@/lib/r2Assets";

type R2ImageProps = {
  kind: AssetKind;
  filename: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  imgProps?: ImgHTMLAttributes<HTMLImageElement>;
};

export function R2Image({
  kind,
  filename,
  fallbackSrc,
  alt,
  className,
  imgProps,
}: R2ImageProps) {
  const [failedSources, setFailedSources] = useState<Set<string>>(new Set());

  const primarySrc = useMemo(
    () => buildR2Url(kind, filename),
    [kind, filename],
  );
  const currentSrc = !failedSources.has(primarySrc)
    ? primarySrc
    : fallbackSrc && !failedSources.has(fallbackSrc)
      ? fallbackSrc
      : "";

  if (!currentSrc) {
    return <span className={className} role="img" aria-label={alt} />;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={() => {
        setFailedSources((prev) => {
          const next = new Set(prev);
          next.add(currentSrc);
          return next;
        });
      }}
      {...imgProps}
    />
  );
}

import { useMemo, useState, type ImgHTMLAttributes } from "react";

type R2ImageKind = "badges" | "icons" | "placeholders" | "utility";

type R2ImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  kind: R2ImageKind;
  filename: string;
  fallbackSrc: string;
};

const r2BaseUrl = (import.meta.env.VITE_R2_PUBLIC_BASE_URL as string | undefined)?.trim();

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export function R2Image({ kind, filename, fallbackSrc, alt, onError, ...props }: R2ImageProps) {
  const r2Src = useMemo(() => {
    if (!r2BaseUrl) return null;
    return joinUrl(r2BaseUrl, `${kind}/${filename}`);
  }, [kind, filename]);

  const [useFallback, setUseFallback] = useState(!r2Src);

  const src = useFallback ? fallbackSrc : (r2Src ?? fallbackSrc);

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      onError={(event) => {
        if (!useFallback) setUseFallback(true);
        onError?.(event);
      }}
    />
  );
}

export type { R2ImageKind };

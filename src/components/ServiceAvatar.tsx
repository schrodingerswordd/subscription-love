import { useState } from "react";
import { getServicePreset, getInitials } from "@/lib/services";

interface Props {
  name: string;
  size?: number;
  className?: string;
}

export function ServiceAvatar({ name, size = 44, className }: Props) {
  const preset = getServicePreset(name);
  const bg = preset?.color ?? "#6366F1";
  const initials = getInitials(name || "?");
  const [imgFailed, setImgFailed] = useState(false);

  // Determine readable text color based on background luminance
  const isDark = (() => {
    const hex = bg.replace("#", "");
    if (hex.length !== 6) return true;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luma < 0.6;
  })();

  // simple-icons CDN serves monochrome SVGs; we tint to white or near-black
  const tint = isDark ? "white" : "111111";
  const logoUrl = preset?.slug
    ? `https://cdn.simpleicons.org/${preset.slug}/${tint}`
    : preset?.domain
      ? `https://www.google.com/s2/favicons?sz=128&domain=${preset.domain}`
      : null;
  // Favicon fallback is full-color, so render at full avatar size with no tint
  const isFavicon = !preset?.slug && !!preset?.domain;
  const inner = isFavicon ? size * 0.78 : size * 0.55;

  return (
    <div
      className={"flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-semibold " + (className ?? "")}
      style={{
        backgroundColor: bg,
        color: isDark ? "#fff" : "#111",
        width: size,
        height: size,
        fontSize: size * 0.36,
        letterSpacing: "-0.02em",
      }}
    >
      {logoUrl && !imgFailed ? (
        <img
          src={logoUrl}
          alt={name}
          width={inner}
          height={inner}
          loading="lazy"
          onError={() => setImgFailed(true)}
          style={{ width: inner, height: inner, objectFit: "contain" }}
        />
      ) : (
        initials
      )}
    </div>
  );
}

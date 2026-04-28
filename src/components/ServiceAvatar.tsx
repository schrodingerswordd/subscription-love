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

  // Determine readable text color
  const isDark = (() => {
    const hex = bg.replace("#", "");
    if (hex.length !== 6) return true;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luma < 0.6;
  })();

  return (
    <div
      className={"flex shrink-0 items-center justify-center rounded-xl font-semibold " + (className ?? "")}
      style={{
        backgroundColor: bg,
        color: isDark ? "#fff" : "#111",
        width: size,
        height: size,
        fontSize: size * 0.36,
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
}

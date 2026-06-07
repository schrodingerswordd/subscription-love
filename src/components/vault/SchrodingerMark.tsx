import { cn } from "@/lib/utils";

/**
 * SchrodingerMark
 * ----------------
 * The "coded identity" element for Schrödinger's Archive.
 *
 * A subtle, abstract feline silhouette enclosed in a vault aperture, paired
 * with a quantum "alive / dead" superposition indicator. Per the Bunker
 * Minimalist brand, this is the ONLY overt coded-identity motif — clinical,
 * geometric, and authoritative rather than illustrative. It reads as a
 * security sigil first and a feline reference second, giving the "Thinker"
 * audience a quiet nod without compromising mainstream authority.
 *
 * `state` drives the quantum indicator:
 *   - "superposition" (default): both alive + dead nodes glow at reduced opacity
 *   - "alive":  single steady node, primary color
 *   - "dead":   single dim node, muted
 */

type QuantumState = "superposition" | "alive" | "dead";

interface SchrodingerMarkProps {
  className?: string;
  /** Pixel size of the square mark. */
  size?: number;
  /** Quantum state of the indicator. */
  state?: QuantumState;
  /** Render the enclosing vault aperture ring. */
  ring?: boolean;
  /** Accessible title; set to "" to mark purely decorative. */
  title?: string;
}

export const SchrodingerMark = ({
  className,
  size = 40,
  state = "superposition",
  ring = true,
  title = "Schrödinger's Archive",
}: SchrodingerMarkProps) => {
  const decorative = title === "";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
      className={cn("text-primary", className)}
    >
      {!decorative && <title>{title}</title>}

      {/* Vault aperture ring */}
      {ring && (
        <>
          <circle
            cx="32"
            cy="32"
            r="30"
            stroke="currentColor"
            strokeOpacity="0.25"
            strokeWidth="1"
          />
          {/* Aperture ticks — clinical, evenly spaced */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x1 = 32 + Math.cos(a) * 30;
            const y1 = 32 + Math.sin(a) * 30;
            const x2 = 32 + Math.cos(a) * 27;
            const y2 = 32 + Math.sin(a) * 27;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeOpacity="0.4"
                strokeWidth="1"
              />
            );
          })}
        </>
      )}

      {/* Abstract feline silhouette — geometric, built from clean strokes.
          Two ears, a defined head, and a poised posture. Minimal, not cute. */}
      <g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        fill="none"
      >
        {/* Left ear */}
        <path d="M22 30 L24 18 L30 26" />
        {/* Right ear */}
        <path d="M42 30 L40 18 L34 26" />
        {/* Head / jaw */}
        <path d="M22 30 Q22 40 32 44 Q42 40 42 30" />
        {/* Inner sight line (eyes as a single clinical bar) */}
        <line x1="27" y1="33" x2="37" y2="33" strokeOpacity="0.55" />
      </g>

      {/* Quantum alive / dead superposition indicator */}
      <g>
        {/* ALIVE node (upper-right) */}
        <circle
          cx="48"
          cy="16"
          r="2.4"
          fill="currentColor"
          className="text-emerald-400"
          opacity={state === "dead" ? 0.12 : state === "alive" ? 1 : 0.55}
        />
        {/* DEAD node (lower-left) */}
        <circle
          cx="16"
          cy="48"
          r="2.4"
          fill="currentColor"
          className="text-muted-foreground"
          opacity={state === "alive" ? 0.12 : state === "dead" ? 1 : 0.55}
        />
        {/* Superposition link */}
        {state === "superposition" && (
          <line
            x1="46.3"
            y1="17.7"
            x2="17.7"
            y2="46.3"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeDasharray="2 3"
            strokeWidth="1"
          />
        )}
      </g>
    </svg>
  );
};

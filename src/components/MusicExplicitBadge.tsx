type MusicExplicitBadgeProps = {
  size?: "md" | "sm";
};

export default function MusicExplicitBadge({ size = "md" }: MusicExplicitBadgeProps) {
  return (
    <span
      className={`music-explicit-badge music-explicit-badge--${size}`}
      aria-label="Explicit"
      title="Explicit"
    >
      E
    </span>
  );
}

export function Avatar({
  emoji,
  color,
  size = 40,
  ring = false,
}: {
  emoji: string;
  color: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 ${ring ? "gold-ring" : ""}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        fontSize: size * 0.5,
        boxShadow: ring ? undefined : `0 2px 8px ${color}55`,
      }}
    >
      <span style={{ lineHeight: 1 }}>{emoji}</span>
    </div>
  );
}

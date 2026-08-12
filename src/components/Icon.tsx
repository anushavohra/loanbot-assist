interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
}

/** Material Symbols Outlined glyph. */
export function Icon({ name, className = "", filled = false }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbol select-none ${className}`}
      style={filled ? { fontVariationSettings: '"FILL" 1' } : undefined}
    >
      {name}
    </span>
  );
}

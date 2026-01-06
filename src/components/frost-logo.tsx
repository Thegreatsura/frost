interface FrostLogoProps {
  className?: string;
  size?: number;
}

export function FrostLogo({ className, size = 20 }: FrostLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="12" />
    </svg>
  );
}

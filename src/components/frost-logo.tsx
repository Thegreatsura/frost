interface FrostLogoProps {
  className?: string;
}

export function FrostLogo({ className }: FrostLogoProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
      <line x1="12" y1="2" x2="9" y2="5" />
      <line x1="12" y1="2" x2="15" y2="5" />
      <line x1="12" y1="22" x2="9" y2="19" />
      <line x1="12" y1="22" x2="15" y2="19" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="6.34" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="7.76" />
      <line x1="19.07" y1="19.07" x2="16.24" y2="17.66" />
      <line x1="19.07" y1="19.07" x2="17.66" y2="16.24" />
      <line x1="19.07" y1="4.93" x2="16.24" y2="6.34" />
      <line x1="19.07" y1="4.93" x2="17.66" y2="7.76" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="17.66" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="16.24" />
    </svg>
  );
}

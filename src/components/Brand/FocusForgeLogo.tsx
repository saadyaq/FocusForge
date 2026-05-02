interface FocusForgeLogoProps {
  showWordmark?: boolean;
  className?: string;
}

export function FocusForgeLogo({ showWordmark = true, className = "" }: FocusForgeLogoProps) {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`} aria-label="FocusForge">
      <svg
        className="h-11 w-11 shrink-0"
        viewBox="0 0 48 48"
        role="img"
        aria-hidden={!showWordmark}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="12" fill="#151515" className="dark:fill-[#f5f1e8]" />
        <circle cx="24" cy="24" r="14" fill="none" stroke="#3b7f75" strokeWidth="4" />
        <path
          d="M24 11v26M11 24h26"
          stroke="#f7f5f0"
          strokeLinecap="round"
          strokeWidth="4"
          className="dark:stroke-[#151515]"
        />
        <circle cx="24" cy="24" r="4" fill="#c7842b" />
      </svg>

      {showWordmark && (
        <div className="min-w-0">
          <p className="text-base font-semibold leading-none tracking-normal text-forge-ink dark:text-[#f5f1e8]">
            FocusForge
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-forge-accent">Deep work</p>
        </div>
      )}
    </div>
  );
}

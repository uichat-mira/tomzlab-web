/**
 * Minimal vector notebook based on tomzlab-web/prod's original CSS drawing.
 * Preserve the site's illustration language: quiet geometry, one thin leaf,
 * a spine rule and a shallow offset shadow, never photorealistic materials.
 */
export function NotebookIllustration() {
  return (
    <svg
      className="site-home__notebook-art"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 330 390"
      role="img"
      aria-label="一张珍珠白的记事本封面，印着 tomzlab.cn、2026 和 NOTES / 001"
    >
      <defs>
        <linearGradient id="folio-notebook-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffefa" />
          <stop offset="1" stopColor="#f7f6f1" />
        </linearGradient>
        <filter id="folio-notebook-shadow" x="-30%" y="-30%" width="170%" height="180%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      <g transform="rotate(3 165 195)">
        {/* A single quiet shadow and offset sheet retain the original flat style. */}
        <rect x="52" y="49" width="258" height="323" rx="12"
          fill="#434238" opacity=".065" filter="url(#folio-notebook-shadow)" />
        <rect x="45" y="37" width="258" height="325" rx="11"
          fill="#eeede7" stroke="#e6e4dc" strokeWidth="1" />
        {/* Cover: no grain, embossing, multi-page stack or photographic lighting. */}
        <rect x="37" y="30" width="258" height="325" rx="10"
          fill="url(#folio-notebook-paper)" stroke="#deddd7" strokeWidth="1" />
        <path d="M57 31 V354" stroke="#e2e1db" strokeWidth="1.15" />
        <path d="M59 33 V351" stroke="#fffefa" strokeWidth=".85" />
        <path d="M278 31 Q294 31 295 47" fill="none"
          stroke="#e9e7df" strokeWidth="1" />

        <g fill="#6c6e68"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          fontSize="10.5" letterSpacing=".6">
          <text x="75" y="65">tomzlab.cn</text>
          <text x="261" y="65" textAnchor="end">2026</text>
          <text x="75" y="324" letterSpacing="1.2">NOTES / 001</text>
        </g>
        <g stroke="#e6e5de" strokeWidth="1" strokeLinecap="round" fill="none">
          <path d="M75 107 H267" />
          <path d="M75 136 H239" />
          <path d="M75 165 H206" />
        </g>
      </g>
    </svg>
  );
}

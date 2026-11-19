/**
 * A deliberately small, editable vector illustration, not a raster asset.
 * Materials (paper / ink) are stable physical colors; the site canvas stays
 * under Folio's Pearl preset and is not repainted by this component.
 */
export function NotebookIllustration() {
  return (
    <svg
      className="site-home__notebook-art"
      viewBox="0 0 360 420"
      role="img"
      aria-label="一册象牙白纸质笔记本，封面印着 tomzlab.cn、2026 和 NOTES / 001"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="notebook-cover" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#fffefa" />
          <stop offset=".54" stopColor="#faf9f4" />
          <stop offset="1" stopColor="#efeee8" />
        </linearGradient>
        <linearGradient id="notebook-spine" x1="0" x2="1">
          <stop stopColor="#dddcd3" stopOpacity=".45" />
          <stop offset=".18" stopColor="#fffefa" />
          <stop offset=".59" stopColor="#d4d1c7" stopOpacity=".32" />
          <stop offset="1" stopColor="#fffefa" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="notebook-edge" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#fffefa" />
          <stop offset=".75" stopColor="#e5e3db" />
          <stop offset="1" stopColor="#d8d6ce" />
        </linearGradient>
        <filter id="notebook-shadow" x="-45%" y="-35%" width="200%" height="190%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="notebook-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="3" seed="7" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
          <feComponentTransfer in="mono">
            <feFuncA type="linear" slope=".055" />
          </feComponentTransfer>
        </filter>
        <clipPath id="notebook-clip">
          <rect x="61" y="39" width="240" height="328" rx="10" />
        </clipPath>
      </defs>
      {/* All physical elements are grouped so the shadow, paper and print tilt together. */}
      <g transform="rotate(3 181 207)">
        <rect x="71" y="58" width="242" height="333" rx="14"
          fill="#78766c" opacity=".20" filter="url(#notebook-shadow)" />
        {/* Two exposed leaves and a slender fore-edge add actual notebook depth. */}
        <rect x="67" y="47" width="242" height="328" rx="11"
          fill="#e3e1d9" stroke="#d2d0c8" strokeWidth=".65" />
        <path d="M75 371 Q186 378 302 372 L302 378 Q185 386 74 377Z"
          fill="url(#notebook-edge)" stroke="#d8d6cd" strokeWidth=".6" />
        <path d="M302 52 Q311 56 309 68 L309 362 Q308 373 301 375"
          fill="none" stroke="#d5d2c8" strokeWidth="1.25" />
        <rect x="61" y="39" width="240" height="328" rx="10"
          fill="url(#notebook-cover)" stroke="#d9d7cf" strokeWidth=".9" />
        <rect x="61" y="39" width="240" height="328" rx="10"
          fill="#918d7d" filter="url(#notebook-grain)" clipPath="url(#notebook-clip)" />
        {/* Cover bevel and hinge: three unequal strokes rather than a heavy border. */}
        <path d="M72 40 Q67 43 67 53 V356 Q68 366 78 367"
          fill="none" stroke="#fffefa" strokeWidth="2.2" opacity=".94" />
        <path d="M79 42 V364" stroke="#cfcdc5" strokeWidth=".75" opacity=".85" />
        <path d="M80.8 45 V361" stroke="#fffefa" strokeWidth="1.05" opacity=".93" />
        <path d="M82 42 Q87 39 93 39 H288"
          fill="none" stroke="#fff" strokeWidth="1.4" opacity=".9" />
        <rect x="61.6" y="39.6" width="17" height="327" rx="9"
          fill="url(#notebook-spine)" opacity=".73" />
        {/* The ink is intentionally just a little darker than the guidelines. */}
        <g fill="#696960" fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          fontSize="10.2" letterSpacing="1.1">
          <text x="94" y="76">tomzlab.cn</text>
          <text x="259" y="76" textAnchor="end">2026</text>
          <text x="93" y="330" letterSpacing="1.35">NOTES / 001</text>
        </g>
        <g stroke="#c9c7bd" strokeWidth=".8" strokeLinecap="round" fill="none">
          <path d="M94 112 H266" opacity=".80" />
          <path d="M94 139 H249" opacity=".68" />
          <path d="M94 166 H220" opacity=".53" />
        </g>
        <path d="M91 91 H267" stroke="#fffefa" opacity=".55" strokeWidth=".7" />
        <path d="M65 356 Q67 362 72 364" stroke="#bcb9b0" opacity=".45"
          strokeWidth=".8" fill="none" />
      </g>
    </svg>
  );
}

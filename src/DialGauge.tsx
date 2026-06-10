type DialGaugeProps = {
  /** 0..1 fraction of the arc that is "lit" */
  fill: number;
  /** colour of the lit ticks */
  color: string;
  /** 0..1 position of the person's baseline marker (optional) */
  baseline?: number;
  /** shape of the moving pointer */
  indicator?: "triangle" | "needle" | "dot" | "caret";
  /** empty/placeholder: all ticks dim grey, no highlight, no pointer */
  empty?: boolean;
  width?: number;
  height?: number;
};

/**
 * Pace-of-aging gauge — an arc of ticks over the top of the card.
 * The lit portion grows with `fill`; the rest stay dim.
 * Replaces the static dial image (Figma node 22217:148281).
 */
export default function DialGauge({
  fill,
  color,
  baseline,
  indicator = "triangle",
  empty = false,
  width = 361,
  height = 300,
}: DialGaugeProps) {
  // odd count + symmetric sweep (200°→−20°, centered on 90°) means the middle
  // tick sits exactly at 90° (vertical), so pace 1.0x lands dead-centre.
  const TICKS = 65;
  const cx = width / 2;
  const cy = 250; // center sits low so only the top arc shows
  const rOuter = 232;
  const tickLen = 16;
  const PAD = 36; // top headroom so the indicator never clips

  // sweep over the top: from lower-left (200°) to lower-right (-20°)
  const startDeg = 200;
  const endDeg = -20;
  const stepDeg = (endDeg - startDeg) / (TICKS - 1);

  const clamped = Math.max(0, Math.min(1, fill));

  // The "active" gauge lives only within a safe angular range that keeps both
  // the coloured fill AND the indicator on the card. Ticks outside this range
  // are decorative and always dim. The bar itself keeps its full wide sweep.
  const SAFE_MIN = 52;
  const SAFE_MAX = 128;
  const isActive = (deg: number) => deg >= SAFE_MIN && deg <= SAFE_MAX;

  // contiguous block of active indices (deg decreases as i increases)
  const activeIdx = Array.from({ length: TICKS }, (_, i) => i).filter((i) =>
    isActive(startDeg + stepDeg * i)
  );
  const aStart = activeIdx[0];
  const aEnd = activeIdx[activeIdx.length - 1];
  const activeCount = aEnd - aStart + 1;
  const litActive = Math.round(clamped * (activeCount - 1));
  const litIdx = aStart + litActive; // last lit tick (and triangle position)

  // Highlight the selected tick and fade out the ones near it, rather than
  // filling everything up to it like a progress bar.
  const SPREAD = 5; // how many ticks on each side get highlighted
  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const deg = startDeg + stepDeg * i;
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x1 = cx + rOuter * cos;
    const y1 = cy - rOuter * sin;
    const x2 = cx + (rOuter - tickLen) * cos;
    const y2 = cy - (rOuter - tickLen) * sin;
    const dist = Math.abs(i - litIdx);
    // brightness peaks at the selected tick, eases to 0 by SPREAD
    const glowAmt = dist <= SPREAD ? Math.pow(1 - dist / (SPREAD + 1), 1.6) : 0;
    // fade the dim base ticks toward both ends of the arc
    const FADE = 12;
    const edge = Math.min(i, TICKS - 1 - i);
    const edgeFade = Math.min(1, edge / FADE);
    return { x1, y1, x2, y2, glowAmt, edgeFade };
  });

  // indicator: small triangle just OUTSIDE the last lit tick, apex pointing
  // inward. Snaps to the lit tick and glides via a CSS transform transition.
  const indDeg = startDeg + stepDeg * litIdx;
  const indRad = (indDeg * Math.PI) / 180;
  const baseR = rOuter + 26; // ~20px gap above the outer end of the tick
  const ix = cx + baseR * Math.cos(indRad);
  const iy = cy - baseR * Math.sin(indRad);
  const indRot = 90 - indDeg; // makes local +Y point toward the center

  // baseline marker — a longer notch sitting just inside the tick row at the
  // person's baseline position (snapped to the nearest active tick).
  let baseMarker: { bx1: number; by1: number; bx2: number; by2: number } | null =
    null;
  if (baseline != null) {
    const bClamped = Math.max(0, Math.min(1, baseline));
    const bIdx = aStart + Math.round(bClamped * (activeCount - 1));
    const bDeg = startDeg + stepDeg * bIdx;
    const bRad = (bDeg * Math.PI) / 180;
    const cos = Math.cos(bRad);
    const sin = Math.sin(bRad);
    const inner = rOuter - tickLen - 8;
    baseMarker = {
      bx1: cx + inner * cos,
      by1: cy - inner * sin,
      bx2: cx + (inner - 10) * cos,
      by2: cy - (inner - 10) * sin,
    };
  }

  return (
    <svg
      className="poa__gauge"
      width={width}
      height={height + PAD}
      viewBox={`0 ${-PAD} ${width} ${height + PAD}`}
      fill="none"
      aria-hidden
    >
      {ticks.map((tk, i) => (
        <g key={i}>
          {/* dim base tick (always present) */}
          <line
            x1={tk.x1}
            y1={tk.y1}
            x2={tk.x2}
            y2={tk.y2}
            stroke="white"
            strokeOpacity={0.16 * tk.edgeFade}
            strokeWidth={2.6}
            strokeLinecap="butt"
          />
          {/* highlighted overlay — opacity follows proximity to selection */}
          {!empty && tk.glowAmt > 0 && (
            <line
              x1={tk.x1}
              y1={tk.y1}
              x2={tk.x2}
              y2={tk.y2}
              stroke={color}
              strokeWidth={2.6}
              strokeLinecap="butt"
              opacity={tk.glowAmt}
              style={{ transition: "opacity 400ms ease, stroke 500ms ease" }}
            />
          )}
        </g>
      ))}

      {!empty && baseMarker && (
        <line
          x1={baseMarker.bx1}
          y1={baseMarker.by1}
          x2={baseMarker.bx2}
          y2={baseMarker.by2}
          stroke="white"
          strokeOpacity={0.85}
          strokeWidth={2.6}
          strokeLinecap="round"
          style={{ transition: "all 320ms ease" }}
        />
      )}

      <g
        style={{
          transform: `translate(${ix}px, ${iy}px) rotate(${indRot}deg)`,
          transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          display: empty ? "none" : undefined,
        }}
      >
        {/* local +Y points inward (toward the dial centre) after rotation */}
        {indicator === "triangle" && (
          <polygon points="0,9 -5,0 5,0" fill={color} style={{ transition: "fill 500ms ease" }} />
        )}
        {indicator === "needle" && (
          <line x1={0} y1={11} x2={0} y2={0} stroke={color} strokeWidth={3} strokeLinecap="round" style={{ transition: "stroke 500ms ease" }} />
        )}
        {indicator === "dot" && (
          <circle cx={0} cy={4} r={3.6} fill={color} style={{ transition: "fill 500ms ease" }} />
        )}
        {indicator === "caret" && (
          <polyline points="-5,0 0,7 5,0" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 500ms ease" }} />
        )}
      </g>
    </svg>
  );
}

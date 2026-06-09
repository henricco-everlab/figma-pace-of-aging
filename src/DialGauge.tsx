type DialGaugeProps = {
  /** 0..1 fraction of the arc that is "lit" */
  fill: number;
  /** colour of the lit ticks */
  color: string;
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
  width = 361,
  height = 300,
}: DialGaugeProps) {
  const TICKS = 52;
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

  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const deg = startDeg + stepDeg * i;
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x1 = cx + rOuter * cos;
    const y1 = cy - rOuter * sin;
    const x2 = cx + (rOuter - tickLen) * cos;
    const y2 = cy - (rOuter - tickLen) * sin;
    // everything up to (and including) the indicator is filled — so the
    // lower-left decorative ticks start already lit; the lower-right stay dim.
    const lit = i <= litIdx;
    return { x1, y1, x2, y2, lit };
  });

  // indicator: small triangle just OUTSIDE the last lit tick, apex pointing
  // inward. Snaps to the lit tick and glides via a CSS transform transition.
  const indDeg = startDeg + stepDeg * litIdx;
  const indRad = (indDeg * Math.PI) / 180;
  const baseR = rOuter + 26; // ~20px gap above the outer end of the tick
  const ix = cx + baseR * Math.cos(indRad);
  const iy = cy - baseR * Math.sin(indRad);
  const indRot = 90 - indDeg; // makes local +Y point toward the center

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
        <line
          key={i}
          x1={tk.x1}
          y1={tk.y1}
          x2={tk.x2}
          y2={tk.y2}
          stroke={tk.lit ? color : "rgba(255,255,255,0.16)"}
          strokeWidth={2}
          strokeLinecap="round"
          style={{ transition: "stroke 500ms ease" }}
        />
      ))}

      <g
        style={{
          transform: `translate(${ix}px, ${iy}px) rotate(${indRot}deg)`,
          transition: "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* apex points toward +Y (inward after rotation), base sits outward */}
        <polygon points="0,9 -5,0 5,0" fill={color} style={{ transition: "fill 500ms ease" }} />
      </g>
    </svg>
  );
}

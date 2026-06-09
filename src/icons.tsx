// Icons. Moon + Heart are exact exports from Figma (li-new:moon 21567:4533,
// li-new:heart-plus 21567:4807). Activity is the matching Lucide "activity"
// glyph. All render in currentColor.

/**
 * Proportional score ring — fills clockwise from the top.
 * `value` 0–100 maps to 0–full circle.
 */
export function ProgressCircular({
  size = 16,
  value = 100,
  color = "white",
}: {
  size?: number;
  value?: number;
  color?: string;
}) {
  const stroke = 2.4;
  const r = (16 - stroke) / 2; // radius within a 16x16 box
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* track */}
      <circle cx="8" cy="8" r={r} stroke="white" strokeOpacity="0.24" strokeWidth={stroke} />
      {/* progress arc — starts at 12 o'clock, sweeps clockwise */}
      <circle
        cx="8"
        cy="8"
        r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform="rotate(-90 8 8)"
        style={{ transition: "stroke-dashoffset 400ms ease" }}
      />
    </svg>
  );
}

export function MoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16.6666 16.6666"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path
        d="M8.4578 0.00895182C8.74352 0.0520461 8.99026 0.241889 9.10315 0.514323C9.23212 0.825706 9.1608 1.1842 8.92248 1.42253C8.0842 2.26081 7.61308 3.39783 7.61308 4.58333C7.61308 5.76884 8.0842 6.90586 8.92248 7.74414C9.76076 8.58241 10.8978 9.05355 12.0833 9.05355C13.2688 9.05354 14.4058 8.58241 15.2441 7.74414C15.4824 7.50583 15.8409 7.4345 16.1523 7.56348C16.4636 7.6925 16.6666 7.99633 16.6666 8.33333C16.6666 9.9815 16.1777 11.5927 15.262 12.9631C14.3464 14.3334 13.0452 15.402 11.5226 16.0327C9.99988 16.6634 8.32381 16.8279 6.70732 16.5064C5.09092 16.1848 3.60592 15.3914 2.44055 14.2261C1.27518 13.0607 0.481854 11.5757 0.160277 9.95931C-0.161267 8.3428 0.00317946 6.66676 0.63391 5.14404C1.26463 3.6214 2.33323 2.32028 3.70357 1.40462C5.07397 0.488957 6.68513 6.28435e-07 8.33329 0L8.4578 0.00895182ZM6.56164 1.90674C5.87819 2.09515 5.22552 2.3924 4.62968 2.79053C3.53341 3.52303 2.67903 4.56397 2.17444 5.78206C1.66988 7.00018 1.53721 8.34065 1.79439 9.63379C2.05163 10.927 2.68659 12.1153 3.61894 13.0477C4.55128 13.98 5.73964 14.615 7.03284 14.8722C8.32597 15.1294 9.66646 14.9967 10.8846 14.4922C12.1026 13.9876 13.1436 13.1332 13.8761 12.0369C14.2743 11.4409 14.5707 10.7878 14.7591 10.1042C13.9325 10.5048 13.0192 10.7202 12.0833 10.7202C10.4558 10.7202 8.89494 10.0734 7.7441 8.92253C6.59326 7.77169 5.94641 6.21087 5.94641 4.58333C5.94641 3.64724 6.16095 2.7334 6.56164 1.90674Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function HeartIcon({ size = 16 }: { size?: number }) {
  // li-new:heart (plain)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function ActivityIcon({ size = 16 }: { size?: number }) {
  // flame
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

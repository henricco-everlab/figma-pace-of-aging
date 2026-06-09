import type { ReactNode } from "react";
import Card from "./Card";
import DialGauge from "./DialGauge";
import { MoonIcon, HeartIcon, ActivityIcon } from "./icons";
import "./PaceOfAgingCard.css";

type Metric = { label: string; score: number; icon: ReactNode };

/** Score band → realistic qualitative label. */
function scoreLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Great";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  return "Poor";
}

const METRICS: Metric[] = [
  { label: "Sleep score", score: 96, icon: <MoonIcon /> },
  { label: "Recovery", score: 82, icon: <HeartIcon /> },
  { label: "Activity", score: 89, icon: <ActivityIcon /> },
];

/** Green (slow aging) → orange (fast aging), pivoting around 1.0x. */
export function paceColor(pace: number) {
  const t = Math.max(0, Math.min(1, (pace - 0.5) / 1.0));
  const green = { r: 159, g: 248, b: 139 }; // #9FF88B
  const orange = { r: 255, g: 145, b: 90 }; // #FF915A
  const mix = (a: number, b: number) => Math.round(a + (b - a) * t);
  return `rgb(${mix(green.r, orange.r)}, ${mix(green.g, orange.g)}, ${mix(
    green.b,
    orange.b
  )})`;
}

function rating(pace: number) {
  if (pace < 0.9) return "Great";
  if (pace <= 1.1) return "On track";
  return "Needs work";
}

export type RowStyle = "progress" | "icon";

type Props = { pace: number; rowStyle?: RowStyle };

/**
 * Pace of aging screen card — Figma node 22231:60234.
 * The ambient glow drifts continuously and shifts hue with the pace value.
 * The hero number briefly blurs as it changes for an elegant transition.
 */
export default function PaceOfAgingCard({ pace, rowStyle = "progress" }: Props) {
  const glow = paceColor(pace);
  const fill = (pace - 0.5) / 1.0;

  return (
    <div className="poa" style={{ ["--glow" as string]: glow }}>
      <div className="poa__glow" aria-hidden />

      <div className="poa__top">
        <DialGauge fill={fill} color={glow} />

        <div className="poa__hero">
          <p className="poa__kicker">Pace of aging</p>
          <p className="poa__stat">{pace.toFixed(2)}x</p>
          <span className="poa__rating-badge">{rating(pace)}</span>
        </div>

        <p className="poa__caption poa__caption--ai">
          Rest and a light ride did the trick, you're aging a touch slower
          today.
        </p>
      </div>

      <div className="poa__metrics">
        {METRICS.map((m) => (
          <Card
            key={m.label}
            withIcon={rowStyle === "icon"}
            icon={m.icon}
            label={m.label}
            value={scoreLabel(m.score)}
            score={m.score}
          />
        ))}
      </div>
    </div>
  );
}

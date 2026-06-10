import type { ReactNode } from "react";
import { ProgressCircular, MoonIcon } from "./icons";
import "./Card.css";

export type CardVariant = "ring" | "iconbar" | "iconring" | "plain" | "barunder";

type CardProps = {
  variant?: CardVariant;
  icon?: ReactNode;
  label?: string;
  value?: string;
  score?: number;
};

/**
 * Health-data metric row — Figma node 22231:60235, extended with extra styles.
 *
 *  - ring      : label/value + circular ring + score
 *  - iconbar   : icon tile + label/value + score with a thin progress bar
 *  - iconring  : icon tile + label/value + ring + score
 *  - plain     : label/value + score only (minimal)
 *  - barunder  : icon + label/value + score, full-width bar beneath the row
 */
export default function Card({
  variant = "ring",
  icon,
  label = "Sleep score",
  value = "Great",
  score = 96,
}: CardProps) {
  const pct = Math.max(0, Math.min(100, score));

  if (variant === "barunder") {
    return (
      <div className="card card--col">
        <div className="card__main">
          <div className="card__icon">{icon ?? <MoonIcon />}</div>
          <div className="card__content">
            <p className="card__label">{label}</p>
            <p className="card__value">{value}</p>
          </div>
          <span className="card__score">{score}</span>
        </div>
        <div className="card__bar card__bar--wide">
          <div className="card__bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  if (variant === "iconbar") {
    return (
      <div className="card">
        <div className="card__icon">{icon ?? <MoonIcon />}</div>
        <div className="card__content">
          <p className="card__label">{label}</p>
          <p className="card__value">{value}</p>
        </div>
        <div className="card__trailing">
          <span className="card__score">{score}</span>
          <div className="card__bar">
            <div className="card__bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "iconring") {
    return (
      <div className="card">
        <div className="card__icon">{icon ?? <MoonIcon />}</div>
        <div className="card__content">
          <p className="card__label">{label}</p>
          <p className="card__value">{value}</p>
        </div>
        <div className="card__trailing card__trailing--inline">
          <ProgressCircular value={score} />
          <span className="card__score">{score}</span>
        </div>
      </div>
    );
  }

  if (variant === "plain") {
    return (
      <div className="card">
        <div className="card__content">
          <p className="card__label">{label}</p>
          <p className="card__value">{value}</p>
        </div>
        <span className="card__score">{score}</span>
      </div>
    );
  }

  // ring (default)
  return (
    <div className="card">
      <div className="card__content">
        <p className="card__label">{label}</p>
        <p className="card__value">{value}</p>
      </div>
      <div className="card__trailing card__trailing--inline">
        <ProgressCircular value={score} />
        <span className="card__score">{score}</span>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { ProgressCircular, MoonIcon } from "./icons";
import "./Card.css";

type CardProps = {
  /** Maps to Figma "Property 1": true = Yes variant, false = No variant */
  withIcon?: boolean;
  /** icon shown in the leading tile of the withIcon variant */
  icon?: ReactNode;
  label?: string;
  value?: string;
  score?: number;
  /** Progress fill 0-1 (No variant only) */
  progress?: number;
};

/**
 * Sleep score metric card — Figma node 22231:60235.
 *
 * Two variants:
 *  - withIcon=true  ("Property 1=Yes"): label/value on the left, circular
 *    progress glyph + large score on the right.
 *  - withIcon=false ("Property 1=No"):  leading rounded icon tile, label/value,
 *    score with a thin progress bar underneath.
 */
export default function Card({
  withIcon = false,
  icon,
  label = "Sleep score",
  value = "Great",
  score = 96,
  progress = 0.6,
}: CardProps) {
  if (withIcon) {
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
            <div
              className="card__bar-fill"
              style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

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

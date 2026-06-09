import { useState } from "react";
import PaceOfAgingCard, {
  paceColor,
  type RowStyle,
  type LabelStyle,
} from "./PaceOfAgingCard";
import "./App.css";

export default function App() {
  const [pace, setPace] = useState(0.8);
  const [rowStyle, setRowStyle] = useState<RowStyle>("progress");
  const [labelStyle, setLabelStyle] = useState<LabelStyle>("minimal");
  const glow = paceColor(pace);

  return (
    <div className="stage">
      <PaceOfAgingCard pace={pace} rowStyle={rowStyle} labelStyle={labelStyle} />

      <div
        className="control"
        style={{
          ["--glow" as string]: glow,
          ["--pct" as string]: `${((pace - 0.5) / 1.0) * 100}%`,
        }}
      >
        <div className="control__head">
          <span className="control__label">Pace of aging</span>
          <span className="control__value">{pace.toFixed(2)}x</span>
        </div>
        <input
          className="control__range"
          type="range"
          min={0.5}
          max={1.5}
          step={0.01}
          value={pace}
          onChange={(e) => setPace(parseFloat(e.target.value))}
          aria-label="Pace of aging"
        />

        <div className="control__divider" />

        <div className="control__head">
          <span className="control__label">Metric row style</span>
        </div>
        <div className="seg" role="tablist" aria-label="Metric row style">
          <button
            role="tab"
            aria-selected={rowStyle === "progress"}
            className={`seg__btn ${rowStyle === "progress" ? "is-active" : ""}`}
            onClick={() => setRowStyle("progress")}
          >
            Ring + score
          </button>
          <button
            role="tab"
            aria-selected={rowStyle === "icon"}
            className={`seg__btn ${rowStyle === "icon" ? "is-active" : ""}`}
            onClick={() => setRowStyle("icon")}
          >
            Icon + bar
          </button>
        </div>

        <div className="control__divider" />

        <div className="control__head">
          <span className="control__label">Label style</span>
        </div>
        <div className="seg" role="tablist" aria-label="Label style">
          <button
            role="tab"
            aria-selected={labelStyle === "badge"}
            className={`seg__btn ${labelStyle === "badge" ? "is-active" : ""}`}
            onClick={() => setLabelStyle("badge")}
          >
            Badge
          </button>
          <button
            role="tab"
            aria-selected={labelStyle === "minimal"}
            className={`seg__btn ${labelStyle === "minimal" ? "is-active" : ""}`}
            onClick={() => setLabelStyle("minimal")}
          >
            Minimal
          </button>
        </div>
      </div>
    </div>
  );
}

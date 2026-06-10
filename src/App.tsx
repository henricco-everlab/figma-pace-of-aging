import { useState } from "react";
import PaceOfAgingCard, {
  paceColor,
  type RowStyle,
  type LabelStyle,
  type StatusMetric,
  type Connection,
  type BloodStage,
  type EmptyVariant,
} from "./PaceOfAgingCard";
import "./App.css";

export default function App() {
  const [pace, setPace] = useState(1.0);
  const [baseline, setBaseline] = useState(1.0);
  const [yesterday, setYesterday] = useState(0.97);
  const [rowStyle, setRowStyle] = useState<RowStyle>("ring");
  const [labelStyle, setLabelStyle] = useState<LabelStyle>("minimal");
  const [statusMetric, setStatusMetric] = useState<StatusMetric>("population");
  const [hasBloods, setHasBloods] = useState(true);
  const [hasWearables, setHasWearables] = useState(true);
  const [bloodStage, setBloodStage] = useState<BloodStage>("idle");
  const [emptyVariant, setEmptyVariant] = useState<EmptyVariant>("A");
  const connection: Connection =
    hasBloods && hasWearables
      ? "full"
      : hasBloods
      ? "blood"
      : hasWearables
      ? "wearables"
      : "none";
  const glow = paceColor(pace);

  return (
    <div className="stage">
      <PaceOfAgingCard
        pace={pace}
        baseline={baseline}
        rowStyle={rowStyle}
        labelStyle={labelStyle}
        statusMetric={statusMetric}
        connection={connection}
        bloodStage={bloodStage}
        emptyVariant={emptyVariant}
        yesterday={yesterday}
      />

      <div
        className="control"
        style={{
          ["--glow" as string]: glow,
          ["--pct" as string]: `${((pace - 0.5) / 1.0) * 100}%`,
        }}
      >
        <div className="control__head">
          <span className="control__label">Connected sources</span>
        </div>
        <div className="toggles">
          <div className="toggle-row">
            <span className="toggle-row__label">Blood test</span>
            <button
              type="button"
              role="switch"
              aria-checked={hasBloods}
              aria-label="Blood test"
              className={`switch ${hasBloods ? "is-on" : ""}`}
              onClick={() => setHasBloods((v) => !v)}
            >
              <span className="switch__knob" />
            </button>
          </div>
          <div className="toggle-row">
            <span className="toggle-row__label">Health data</span>
            <button
              type="button"
              role="switch"
              aria-checked={hasWearables}
              aria-label="Health data"
              className={`switch ${hasWearables ? "is-on" : ""}`}
              onClick={() => setHasWearables((v) => !v)}
            >
              <span className="switch__knob" />
            </button>
          </div>
        </div>

        {!hasBloods && (
          <>
            <div className="control__divider" />
            <div className="control__head">
              <span className="control__label">Blood test status</span>
            </div>
            <div className="seg" role="tablist" aria-label="Blood test status">
              {(
                [
                  ["idle", "Not booked"],
                  ["booked", "Booked"],
                  ["pending", "Awaiting"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  role="tab"
                  aria-selected={bloodStage === val}
                  className={`seg__btn ${bloodStage === val ? "is-active" : ""}`}
                  onClick={() => setBloodStage(val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {!hasBloods && !hasWearables && bloodStage === "idle" && (
          <>
            <div className="control__divider" />
            <div className="control__head">
              <span className="control__label">Empty state layout</span>
            </div>
            <div className="seg" role="tablist" aria-label="Empty state layout">
              {(
                [
                  ["A", "Variation A"],
                  ["B", "Variation B"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  role="tab"
                  aria-selected={emptyVariant === val}
                  className={`seg__btn ${emptyVariant === val ? "is-active" : ""}`}
                  onClick={() => setEmptyVariant(val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {connection === "full" && (
          <>
            <div className="control__divider" />
            <div className="control__head">
              <span className="control__label">Today&apos;s pace</span>
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
              aria-label="Pace"
            />
          </>
        )}

        {(connection === "full" || connection === "blood") && (
          <>
            <div className="control__head">
              <span className="control__label">
                {connection === "blood"
                  ? "Current pace indicator"
                  : "Previous test indicator"}
              </span>
              <span className="control__value">{baseline.toFixed(2)}x</span>
            </div>
            <input
              className="control__range"
              style={{
                ["--pct" as string]: `${((baseline - 0.5) / 1.0) * 100}%`,
              }}
              type="range"
              min={0.5}
              max={1.5}
              step={0.01}
              value={baseline}
              onChange={(e) => setBaseline(parseFloat(e.target.value))}
              aria-label="Baseline"
            />
            {connection === "full" && (
              <>
                <div className="control__head">
                  <span className="control__label">Yesterday&apos;s pace</span>
                  <span className="control__value">{yesterday.toFixed(2)}x</span>
                </div>
                <input
                  className="control__range"
                  style={{ ["--pct" as string]: `${((yesterday - 0.5) / 1.0) * 100}%` }}
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.01}
                  value={yesterday}
                  onChange={(e) => setYesterday(parseFloat(e.target.value))}
                  aria-label="Yesterday's pace"
                />
              </>
            )}
          </>
        )}

        {(connection === "full" || connection === "wearables") && (
          <>
            <div className="control__divider" />
            <div className="control__head">
              <span className="control__label">Health data field style</span>
            </div>
            <div className="seg" role="tablist" aria-label="Health data field style">
              {(
                [
                  ["ring", "Ring + score"],
                  ["iconbar", "Icon + bar"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  role="tab"
                  aria-selected={rowStyle === val}
                  className={`seg__btn ${rowStyle === val ? "is-active" : ""}`}
                  onClick={() => setRowStyle(val)}
                >
                  {label}
                </button>
              ))}
            </div>

          </>
        )}

        {connection === "full" && (
          <>
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

            <div className="control__divider" />

            <div className="control__head">
              <span className="control__label">Status metric</span>
            </div>
            <div className="seg" role="tablist" aria-label="Status metric">
              <button
                role="tab"
                aria-selected={statusMetric === "population"}
                className={`seg__btn ${statusMetric === "population" ? "is-active" : ""}`}
                onClick={() => setStatusMetric("population")}
              >
                Population
              </button>
              <button
                role="tab"
                aria-selected={statusMetric === "test"}
                className={`seg__btn ${statusMetric === "test" ? "is-active" : ""}`}
                onClick={() => setStatusMetric("test")}
              >
                Last test
              </button>
            </div>
            <p className="control__hint">
              {statusMetric === "population"
                ? "How you rank against people like you."
                : "Change in your pace since your previous test."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

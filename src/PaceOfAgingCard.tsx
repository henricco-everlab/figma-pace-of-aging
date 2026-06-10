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
  { label: "Sleep score", score: 88, icon: <MoonIcon /> },
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

export type RowStyle = "ring" | "iconbar" | "iconring" | "plain" | "barunder";
export type Indicator = "triangle" | "needle" | "dot" | "caret";
export type LabelStyle = "badge" | "minimal";
export type BaselineStyle = "status" | "insight";
export type StatusMetric = "population" | "test";
/** which data sources are connected */
export type Connection = "full" | "blood" | "wearables" | "none";
/** progress of an as-yet-unconnected blood test */
export type BloodStage = "idle" | "booked" | "pending";
/** layout variant for the nothing-connected state */
export type EmptyVariant = "A" | "B";

type Props = {
  pace: number;
  baseline?: number;
  yesterday?: number;
  bioAge?: number;
  connection?: Connection;
  bloodStage?: BloodStage;
  emptyVariant?: EmptyVariant;
  rowStyle?: RowStyle;
  labelStyle?: LabelStyle;
  baselineStyle?: BaselineStyle;
  statusMetric?: StatusMetric;
  indicator?: Indicator;
};

function DropletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2.5 6.5 9a7 7 0 1 0 11 0L12 2.5Z" />
    </svg>
  );
}
function WatchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="3" />
      <path d="M9 6 9.5 3h5L15 6M9 18l.5 3h5l.5-3" />
    </svg>
  );
}

function ConnectPrompt({
  icon,
  title,
  sub,
  cta,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  cta: string;
}) {
  return (
    <div className="poa__connect">
      <span className="poa__connect-ic">{icon}</span>
      <div className="poa__connect-text">
        <p className="poa__connect-title">{title}</p>
        <p className="poa__connect-sub">{sub}</p>
      </div>
      <button className="poa__connect-btn" type="button">
        {cta}
      </button>
    </div>
  );
}

/**
 * Pace of aging screen card — Figma node 22231:60234.
 * The ambient glow drifts continuously and shifts hue with the pace value.
 * The hero number briefly blurs as it changes for an elegant transition.
 */
export default function PaceOfAgingCard({
  pace,
  baseline,
  yesterday = 0.97,
  bioAge = 31,
  connection = "full",
  bloodStage = "idle",
  emptyVariant = "A",
  rowStyle = "ring",
  labelStyle = "badge",
  baselineStyle = "status",
  statusMetric = "population",
  indicator = "triangle",
}: Props) {
  const glow = paceColor(pace);
  const fill = (pace - 0.5) / 1.0;
  const baseFill = baseline != null ? (baseline - 0.5) / 1.0 : undefined;

  // "% slower than your age" = how far below the 1.0x calendar you are.
  // Comparing this between tests makes small pace moves read as substantial,
  // while staying plain-English (no jargon).
  const slower = Math.round((1 - pace) * 100); // +20 = 20% slower, -ve = faster
  const slowerBase = baseline != null ? Math.round((1 - baseline) * 100) : 0;
  const better = baseline != null && pace < baseline - 0.001;
  const worse = baseline != null && pace > baseline + 0.001;
  // plain-English phrase, flips slower/faster around the 1.0x calendar
  const vsAge =
    slower === 0
      ? "matching your biological age"
      : `${Math.abs(slower)}% ${
          slower > 0 ? "slower" : "faster"
        } than your biological age`;
  const vsAgeBase =
    slowerBase === 0
      ? "matched your age"
      : `${Math.abs(slowerBase)}% ${slowerBase > 0 ? "slower" : "faster"}`;
  const showInStatus = baseline != null && baselineStyle === "status";
  const showInInsight = baseline != null && baselineStyle === "insight";

  // three framings for the status line
  // 1) vs your age (calendar)
  // 2) vs previous test (plain pace change)
  // 3) edge / momentum (dramatic — change in your slowdown vs the calendar)
  const testPct =
    baseline != null
      ? Math.round((Math.abs(baseline - pace) / baseline) * 100)
      : 0;
  // population percentile from a realistic distribution: pace-of-aging clusters
  // tightly around 1.0x (mean 1.0, sd 0.12), so small gains move you a lot.
  // percentile = % of people you're ahead of (lower pace is better).
  const erf = (x: number) => {
    const t = 1 / (1 + 0.3275911 * Math.abs(x));
    const y =
      1 -
      ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t -
        0.284496736) *
        t +
        0.254829592) *
        t *
        Math.exp(-x * x);
    return x >= 0 ? y : -y;
  };
  // wider SD = gentler percentile swings (won't hit the extremes so easily)
  const cdf = (v: number) => 0.5 * (1 + erf((v - 1.0) / (0.24 * Math.SQRT2)));
  const percentile = Math.max(1, Math.min(99, Math.round((1 - cdf(pace)) * 100)));
  const vsPopulation =
    percentile >= 60
      ? `Top ${100 - percentile}% of people`
      : percentile >= 45
      ? `Around average`
      : `Bottom ${percentile}% of people`;
  const statusText =
    statusMetric === "test"
      ? better
        ? `${testPct}% better than last test`
        : worse
        ? `${testPct}% worse than last test`
        : `same as last test`
      : vsPopulation;

  // AI insight copy — folds in the baseline comparison when that mode is on
  const insight = showInInsight
    ? better
      ? `Rest and a light ride did the trick. You're aging ${vsAge} now, up from ${vsAgeBase} at your last test.`
      : worse
      ? `A heavier day than usual. You're aging ${vsAge}, down from ${vsAgeBase} at your last test.`
      : `Right where your last test left off, aging ${vsAge}.`
    : (() => {
        const diff = pace - yesterday;
        const amount = Math.abs(diff);
        // no meaningful change since yesterday → no number/arrow
        if (amount < 0.005) {
          return <>Steady as yesterday, you&apos;re holding your pace of aging today.</>;
        }
        const slowerThanYesterday = diff < 0;
        return (
          <>
            {slowerThanYesterday
              ? "Rest and a light ride did the trick, you're aging a bit slower today."
              : "A heavier day than usual, you're aging a bit faster today."}{" "}
            <span className="poa__delta">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {slowerThanYesterday ? (
                  <path d="M12 5v14M19 12l-7 7-7-7" />
                ) : (
                  <path d="M12 19V5M5 12l7-7 7 7" />
                )}
              </svg>
              {amount.toFixed(2)}
            </span>
          </>
        );
      })();

  // metric scores track the pace vs the 1.0 calendar: a faster (worse) pace
  // drags sleep/recovery/activity down, a slower (better) pace lifts them.
  // The upward push is dampened so high scores (esp. 100) are hard to reach.
  const rawShift = (1.0 - pace) * 70;
  const scoreShift = Math.round(rawShift > 0 ? rawShift * 0.45 : rawShift);
  const metricRows = (
    <div className="poa__metrics">
      {METRICS.map((m) => {
        const s = Math.max(1, Math.min(100, m.score + scoreShift));
        return (
          <Card
            key={m.label}
            variant={rowStyle}
            icon={m.icon}
            label={m.label}
            value={scoreLabel(s)}
            score={s}
          />
        );
      })}
    </div>
  );

  // shared empty/locked pace hero (used whenever a blood test isn't connected)
  const emptyPaceHero = (
    <div className="poa__top poa__top--empty">
      <DialGauge fill={0.5} color="#9ff88b" empty />
      <div className="poa__hero">
        <p className="poa__kicker">
          Today&apos;s pace of aging
          <svg className="poa__info" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </svg>
        </p>
        <span className="poa__stat-lock" aria-hidden>
          <svg width="15" height="19" viewBox="0 0 16 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M8 0C5.23858 0 3 2.23858 3 5V7.12602C1.27477 7.57006 0 9.13616 0 11V16C0 18.2091 1.79086 20 4 20H12C14.2091 20 16 18.2091 16 16V11C16 9.13616 14.7252 7.57006 13 7.12602V5C13 2.23858 10.7614 0 8 0ZM11 7V5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5V7H11ZM8 11C8.55229 11 9 11.4477 9 12V15C9 15.5523 8.55229 16 8 16C7.44772 16 7 15.5523 7 15V12C7 11.4477 7.44772 11 8 11Z" />
          </svg>
        </span>
        <span className="poa__rating-minimal poa__rating-minimal--empty">
          {bloodStage === "booked"
            ? "Your blood test is booked. Results unlock your current pace of aging and biological age."
            : bloodStage === "pending"
            ? "Your blood results should arrive by 18 Jul. They'll set your biological age and current pace of aging."
            : "Add a blood test and your health data to see how fast you're aging each day."}
        </span>
      </div>
      {/* When booked but wearables still missing, the priority is connecting
          wearables (the card below), so the appointment is a secondary link. */}
      {bloodStage === "booked" && connection === "none" && (
        <div className="poa__cta-group">
          <button className="poa__lock-btn poa__lock-btn--grey" type="button">
            View appointment
          </button>
        </div>
      )}
      {bloodStage === "booked" && connection !== "none" && (
        <div className="poa__cta-group">
          <button className="poa__lock-btn" type="button">
            View appointment
          </button>
          <button className="poa__lock-btn poa__lock-btn--ghost" type="button">
            Upload my blood test results
          </button>
        </div>
      )}
      {bloodStage === "idle" && (
        <div className="poa__cta-group">
          <button className="poa__lock-btn" type="button">
            Book a blood test
          </button>
          <button className="poa__lock-btn poa__lock-btn--ghost" type="button">
            Upload my blood test results
          </button>
        </div>
      )}
    </div>
  );

  // health-data connect card (shown below the empty hero when wearables are off)
  const healthConnectCard = (
    <div className="poa__metrics">
      <ConnectPrompt
        icon={<WatchIcon />}
        title="Connect health data"
        sub="Watch your habits shape your daily pace of aging"
        cta="Connect"
      />
    </div>
  );

  const paceHero = (
    <div className="poa__top">
      <DialGauge fill={fill} color={glow} baseline={baseFill} indicator={indicator} />

      <div className="poa__hero">
        <p className="poa__kicker">
          Today&apos;s pace of aging
          <svg className="poa__info" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </svg>
        </p>
        <p className="poa__stat">{pace.toFixed(2)}x</p>
        {(() => {
          const status = showInStatus ? statusText : null;
          const text = status ? `${rating(pace)} · ${status}` : rating(pace);
          const isPop = showInStatus && statusMetric === "population";
          const tone = !showInStatus
            ? ""
            : statusMetric === "population"
            ? percentile >= 60
              ? "is-better"
              : percentile >= 45
              ? "is-on"
              : "is-worse"
            : better
            ? "is-better"
            : worse
            ? "is-worse"
            : "is-on";
          const cls = labelStyle === "badge" ? "poa__rating-badge" : "poa__rating-minimal";
          return (
            <span className={`${cls} ${tone}`}>
              {text}
              {isPop && <sup className="poa__ast">*</sup>}
            </span>
          );
        })()}
      </div>

      <p className="poa__caption poa__caption--ai">{insight}</p>
    </div>
  );

  return (
    <div
      className={`poa poa--${connection}`}
      style={{
        ["--glow" as string]:
          connection === "full"
            ? glow
            : connection === "blood"
            ? paceColor(baseline ?? 0.9)
            : "rgba(255,255,255,0.5)",
      }}
    >
      <div className="poa__glow" aria-hidden />
      <div className="poa__noise" aria-hidden />

      {/* ---- NONE + booked/awaiting: stage hero + health-data card ---- */}
      {connection === "none" && bloodStage !== "idle" && (
        <>
          {emptyPaceHero}
          {healthConnectCard}
        </>
      )}

      {/* ---- NONE + idle: Variation A — hero CTAs + single health card ---- */}
      {connection === "none" && bloodStage === "idle" && emptyVariant === "A" && (
        <>
          {emptyPaceHero}
          {healthConnectCard}
        </>
      )}

      {/* ---- NONE + idle: Variation B — two connect cards, no hero CTAs ---- */}
      {connection === "none" && bloodStage === "idle" && emptyVariant === "B" && (
        <>
          <div className="poa__top poa__top--empty">
            <DialGauge fill={0.5} color="#9ff88b" empty />
            <div className="poa__hero">
              <p className="poa__kicker">
          Today&apos;s pace of aging
          <svg className="poa__info" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5M12 8h.01" />
          </svg>
        </p>
              <span className="poa__stat-lock" aria-hidden>
                <svg width="15" height="19" viewBox="0 0 16 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M8 0C5.23858 0 3 2.23858 3 5V7.12602C1.27477 7.57006 0 9.13616 0 11V16C0 18.2091 1.79086 20 4 20H12C14.2091 20 16 18.2091 16 16V11C16 9.13616 14.7252 7.57006 13 7.12602V5C13 2.23858 10.7614 0 8 0ZM11 7V5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5V7H11ZM8 11C8.55229 11 9 11.4477 9 12V15C9 15.5523 8.55229 16 8 16C7.44772 16 7 15.5523 7 15V12C7 11.4477 7.44772 11 8 11Z" />
                </svg>
              </span>
              <span className="poa__rating-minimal poa__rating-minimal--empty">
                Add a blood test and your health data to see how fast you&apos;re
                aging each day.
              </span>
            </div>
          </div>
          <div className="poa__metrics">
            <ConnectPrompt
              icon={<DropletIcon />}
              title="Blood test"
              sub="Sets your biological age & current pace of aging"
              cta="Connect"
            />
            <ConnectPrompt
              icon={<WatchIcon />}
              title="Connect health data"
              sub="Watch your habits shape your daily pace of aging"
              cta="Connect"
            />
          </div>
        </>
      )}

      {/* ---- BLOOD: bloods give baseline pace + bio age; daily variation needs wearables ---- */}
      {connection === "blood" && (
        <>
          <div className="poa__top">
            <DialGauge fill={baseFill ?? 0.4} color={paceColor(baseline ?? 0.9)} />
            <div className="poa__hero">
              <p className="poa__kicker">Current pace of aging</p>
              <p className="poa__stat">{(baseline ?? 0.9).toFixed(2)}x</p>
              {(() => {
                const p = Math.max(
                  1,
                  Math.min(99, Math.round((1 - cdf(baseline ?? 0.9)) * 100))
                );
                const label =
                  p >= 60
                    ? `Top ${100 - p}% of people`
                    : p >= 45
                    ? "Around average"
                    : `Bottom ${p}% of people`;
                return (
                  <span
                    className={`poa__rating-minimal ${
                      p >= 60 ? "is-better" : p >= 45 ? "is-on" : "is-worse"
                    }`}
                  >
                    {label}
                    <sup className="poa__ast">*</sup>
                  </span>
                );
              })()}
            </div>
            <div className="poa__bioage poa__bioage--inline">
              <span className="poa__bioage-label">Biological age</span>
              <span className="poa__bioage-value">{bioAge}</span>
            </div>
          </div>
          <div className="poa__metrics">
            <ConnectPrompt
              icon={<WatchIcon />}
              title="Connect health data"
              sub="Watch your habits shape your daily pace of aging"
              cta="Connect"
            />
          </div>
        </>
      )}

      {/* ---- WEARABLES: health data connected, no bloods → empty/greyed pace ---- */}
      {connection === "wearables" && (
        <>
          {emptyPaceHero}
          {metricRows}
        </>
      )}

      {/* ---- FULL: everything connected ---- */}
      {connection === "full" && (
        <>
          {paceHero}
          {metricRows}
        </>
      )}
    </div>
  );
}

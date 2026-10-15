import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Database,
  RefreshCw,
  UsersRound,
} from "lucide-react";
import { api } from "../lib/api.js";
import "./ModelInsights.css";

const colors = {
  toxic: "#ff7d91",
  nonToxic: "#8cf2c1",
  users: "#74a9ff",
};

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
  });
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <div className="insightMetric">
      <span className="insightMetricIcon">
        <Icon size={18} />
      </span>
      <span className="insightMetricLabel">{label}</span>
      <strong>{value.toLocaleString()}</strong>
      <small>{detail}</small>
    </div>
  );
}

function UserActivityChart({ days }) {
  const max = Math.max(1, ...days.map((day) => day.users));
  return (
    <div className="chartArea">
      <div className="chartLegend">
        <span><i style={{ background: colors.users }} /> Unique users</span>
      </div>
      <div className="barChart userChart" role="img" aria-label="Daily unique users over the last seven days">
        {days.map((day) => (
          <div className="barGroup" key={day.date}>
            <b>{day.users}</b>
            <div className="barTrack">
              <i style={{ height: `${Math.max(4, (day.users / max) * 100)}%` }} />
            </div>
            <small>{formatDate(day.date)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommentActivityChart({ days }) {
  const max = Math.max(
    1,
    ...days.flatMap((day) => [day.toxic, day.nonToxic]),
  );
  return (
    <div className="chartArea">
      <div className="chartLegend">
        <span><i style={{ background: colors.toxic }} /> Toxic</span>
        <span><i style={{ background: colors.nonToxic }} /> Non-toxic</span>
      </div>
      <div className="barChart commentChart" role="img" aria-label="Daily toxic and non-toxic comments over the last seven days">
        {days.map((day) => (
          <div className="barGroup" key={day.date}>
            <div className="barPair">
              <div className="barTrack" title={`${day.toxic} toxic`}>
                <i className="toxicBar" style={{ height: `${Math.max(4, (day.toxic / max) * 100)}%` }} />
              </div>
              <div className="barTrack" title={`${day.nonToxic} non-toxic`}>
                <i className="nonToxicBar" style={{ height: `${Math.max(4, (day.nonToxic / max) * 100)}%` }} />
              </div>
            </div>
            <small>{formatDate(day.date)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function WordCloud({ words }) {
  const max = Math.max(1, ...words.map((word) => word.value));
  if (!words.length) {
    return <p className="insightEmpty">Analyze comments to build the word cloud.</p>;
  }
  return (
    <div className="wordCloud" aria-label="Most frequent words in analyzed comments">
      {words.map((word, index) => (
        <span
          key={word.text}
          style={{
            color: ["#8cf2c1", "#74a9ff", "#ffc86b", "#d8a7ff"][index % 4],
            fontSize: `${Math.round(13 + (word.value / max) * 25)}px`,
          }}
          title={`${word.value} occurrences`}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}

function ToxicityPie({ toxic, nonToxic, total }) {
  const toxicPercent = total ? (toxic / total) * 100 : 0;
  return (
    <div className="pieWrap">
      <div
        className="toxicityPie"
        style={{
          background: `conic-gradient(${colors.toxic} 0% ${toxicPercent}%, ${colors.nonToxic} ${toxicPercent}% 100%)`,
        }}
        role="img"
        aria-label={`${toxic} toxic comments and ${nonToxic} non-toxic comments`}
      >
        <div>
          <strong>{total.toLocaleString()}</strong>
          <span>comments</span>
        </div>
      </div>
      <div className="pieLegend">
        <span><i style={{ background: colors.toxic }} />Toxic <b>{toxic.toLocaleString()}</b></span>
        <span><i style={{ background: colors.nonToxic }} />Non-toxic <b>{nonToxic.toLocaleString()}</b></span>
      </div>
    </div>
  );
}

export default function ModelInsights() {
  const [data, setData] = useState(null);
  const [model, setModel] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [stats, modelInfo] = await Promise.all([
        api("/research/stats"),
        api("/model/info"),
      ]);
      setData(stats);
      setModel(modelInfo);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return <div className="panel insightMessage">Loading model insights…</div>;
  }

  if (error && !data) {
    return (
      <div className="panel insightMessage insightError" role="alert">
        <AlertCircle size={20} />
        <span>{error}</span>
        <button className="ghost" onClick={load}>Try again</button>
      </div>
    );
  }

  return (
    <div className="insightsPage">
      <div className="insightsIntro">
        <div>
          <span className="pill">RESEARCHER WORKSPACE</span>
          <h1>Model <span>insights.</span></h1>
          <p>Explore comment patterns, model configuration, and platform usage from recorded predictions.</p>
        </div>
        <button className="ghost refreshInsights" onClick={load} disabled={loading}>
          <RefreshCw size={16} className={loading ? "spinning" : ""} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && <div className="insightNotice" role="alert">{error}</div>}

      <div className="insightMetrics">
        <Metric icon={Database} label="Analyzed comments" value={data.dataset.total} detail="All saved predictions" />
        <Metric icon={UsersRound} label="Accounts analyzed" value={data.dataset.uniqueUsers} detail="Unique accounts with predictions" />
        <Metric icon={Activity} label="Toxic comments" value={data.dataset.toxic} detail={`${data.dataset.toxicPercent}% of analyzed comments`} />
        <Metric icon={Database} label="Model vocabulary" value={model.vocabularySize} detail={`${model.sequenceLength} token input length`} />
      </div>

      <div className="insightGrid">
        <section className="panel insightPanel">
          <div className="panelHead">
            <div><span className="eyebrow">DATASET OVERVIEW</span><h2>Toxicity split</h2></div>
          </div>
          <ToxicityPie
            toxic={data.dataset.toxic}
            nonToxic={data.dataset.nonToxic}
            total={data.dataset.total}
          />
        </section>

        <section className="panel insightPanel">
          <div className="panelHead">
            <div>
              <span className="eyebrow">TEXT EXPLORER</span>
              <h2>Comment word cloud</h2>
            </div>
            <span className="count">Up to {data.wordSampleSize.toLocaleString()} recent comments</span>
          </div>
          <WordCloud words={data.words} />
        </section>

        <section className="panel insightPanel">
          <div className="panelHead">
            <div><span className="eyebrow">PLATFORM USAGE</span><h2>Daily active users</h2></div>
            <span className="count">Last 7 days</span>
          </div>
          <UserActivityChart days={data.daily} />
        </section>

        <section className="panel insightPanel">
          <div className="panelHead">
            <div><span className="eyebrow">COMMENT ACTIVITY</span><h2>Toxic vs non-toxic</h2></div>
            <span className="count">Last 7 days</span>
          </div>
          <CommentActivityChart days={data.daily} />
        </section>

        <section className="panel modelInfoPanel">
          <div className="panelHead">
            <div><span className="eyebrow">MODEL CARD</span><h2>{model.name}</h2></div>
            <span className="modelBadge">{model.framework}</span>
          </div>
          <div className="modelDetails">
            <div><span>Architecture</span><b>{model.architecture}</b></div>
            <div><span>Output labels</span><b>{model.labels.join(", ")}</b></div>
            <div><span>Input / output shape</span><b>{model.inputShape.join(" × ")} / {model.outputShape.join(" × ")}</b></div>
            <div><span>Preprocessing</span><b>{model.preprocessing}</b></div>
          </div>
          <p className="datasetNote">Dataset totals use all saved predictions. The word cloud is generated from up to the 5,000 most recent analyzed comments.</p>
        </section>
      </div>
    </div>
  );
}

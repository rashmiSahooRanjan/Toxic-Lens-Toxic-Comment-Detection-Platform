import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  ScanText,
  History,
  Users,
  FlaskConical,
  Menu,
  X,
  ChevronRight,
  Activity,
  LockKeyhole,
} from "lucide-react";
import "./styles.css";
import { api, currentUser, logout, saveAuth } from "./lib/api.js";
import ModelInsights from "./pages/ModelInsights.jsx";

const labels = {
  toxic: "Toxic",
  severe_toxic: "Severe Toxic",
  obscene: "Obscene",
  threat: "Threat",
  insult: "Insult",
  identity_hate: "Identity Hate",
};
function App() {
  const [user, setUser] = useState(currentUser());
  const [page, setPage] = useState("dashboard");
  const [mobile, setMobile] = useState(false);
  const nav = useMemo(
    () =>
      user
        ? [
            ["dashboard", "Dashboard", LayoutDashboard],
            ["analyze", "Analyze", ScanText],
            ["history", "History", History],
            ...(user.role !== "user"
              ? [["research", "Research Lab", FlaskConical]]
              : []),
            ...(user.role === "researcher"
              ? [["insights", "Model Insights", Activity]]
              : []),
            ...(user.role === "admin" ? [["users", "Users", Users]] : []),
          ]
        : [],
    [user],
  );
  if (!user)
    return (
      <Auth
        onLogin={(u) => {
          setUser(u);
          setPage("dashboard");
        }}
      />
    );
  return (
    <div className="app">
      <aside className={mobile ? "open" : ""}>
        <div className="brand">
          <div className="brandIcon">
            <ShieldCheck />
          </div>
          <div>
            <b>Voxora</b>
            <small>AI moderation platform</small>
          </div>
        </div>
        <nav>
          {nav.map(([id, name, I]) => (
            <button
              className={page === id ? "active" : ""}
              key={id}
              onClick={() => {
                setPage(id);
                setMobile(false);
              }}
            >
              <I size={18} />
              {name}
              <ChevronRight size={14} />
            </button>
          ))}
        </nav>
        <div className="sideFoot">
          <div className="role">
            <span>{user.role[0].toUpperCase()}</span>
            <div>
              <b>{user.name}</b>
              <small>{user.role}</small>
            </div>
          </div>
          <button
            className="logout"
            onClick={() => {
              logout();
              setUser(null);
            }}
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
      <main>
        <header>
          <button className="mobileMenu" onClick={() => setMobile(!mobile)}>
            {mobile ? <X /> : <Menu />}
          </button>
          <div>
            <span className="eyebrow">WORKSPACE</span>
            <h2>{nav.find((x) => x[0] === page)?.[1] || "Dashboard"}</h2>
          </div>
          <div className="topStatus">
            <span className="dot"></span> AI service online
          </div>
        </header>
        <section className="content">
          {page === "dashboard" && <Dashboard user={user} go={setPage} />}{" "}
          {page === "analyze" && <Analyze />}{" "}
          {page === "history" && <HistoryPage />}{" "}
          {page === "research" && <Research />}{" "}
          {page === "insights" && user.role === "researcher" && (
            <ModelInsights />
          )}{" "}
          {page === "users" && <UsersPage />}
        </section>
      </main>
    </div>
  );
}

function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const d = await api(`/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      saveAuth(d.token, d.user);
      onLogin(d.user);
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <div className="auth">
      <div className="authArt">
        <div className="orb"></div>
        <ShieldCheck size={44} />
        <h1>
          Safer conversations,
          <br />
          <em>powered by AI.</em>
        </h1>
        <p>
          Detect toxic language across six moderation categories with your
          trained deep-learning model.
        </p>
        <div className="chips">
          <span>BiLSTM</span>
          <span>Multi-label</span>
          <span>Real-time</span>
        </div>
      </div>
      <div className="authCard">
        <div className="brand authBrand">
          <div className="brandIcon">
            <ShieldCheck />
          </div>
          <b>Voxora</b>
        </div>
        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="muted">
          {mode === "login"
            ? "Sign in to your moderation workspace."
            : "Start analyzing comments with your AI model."}
        </p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={submit}>
          {mode === "register" && (
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Password (8+ characters)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength="8"
            required
          />
          <button className="primary big">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          className="linkBtn"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Don't have an account? Create one"
            : "Already registered? Sign in"}
        </button>
      </div>
    </div>
  );
}

function Dashboard({ user, go }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    api(user.role === "admin" ? "/admin/dashboard" : "/model/health")
      .then(setData)
      .catch(() => {});
  }, [user]);
  return (
    <>
      <div className="hero">
        <div>
          <span className="pill">AI MODERATION</span>
          <h1>
            Understand toxicity
            <br />
            <span>before it spreads.</span>
          </h1>
          <p>
            Analyze comments using your trained multi-label BiLSTM model and get
            transparent probability scores for every category.
          </p>
          <button className="primary" onClick={() => go("analyze")}>
            Analyze a comment <ChevronRight size={18} />
          </button>
        </div>
        <div className="heroVisual">
          <div className="scanRing">
            <ShieldCheck size={64} />
            <div className="ringText">
              MODEL
              <br />
              <b>READY</b>
            </div>
          </div>
        </div>
      </div>
      <div className="stats">
        <Stat
          icon={Activity}
          title="Model status"
          value={data?.status || "checking"}
          note="Python inference service"
        />
        <Stat
          icon={ScanText}
          title="Six labels"
          value="6"
          note="Multi-label classification"
        />
        <Stat
          icon={LockKeyhole}
          title="Your role"
          value={user.role}
          note="RBAC protected"
        />
        {user.role === "admin" && (
          <Stat
            icon={Users}
            title="Platform users"
            value={data?.usersCount ?? "—"}
            note={`${data?.predictionsCount ?? 0} predictions`}
          />
        )}
      </div>
      <div className="featureGrid">
        <Feature
          n="01"
          title="Write naturally"
          text="Paste a comment exactly as it appears. The backend applies the same cleaning and tokenizer pipeline used during training."
        />
        <Feature
          n="02"
          title="See every signal"
          text="Review probability scores for toxic, obscene, threatening, insulting and identity-hate content."
        />
        <Feature
          n="03"
          title="Research responsibly"
          text="Researchers can run controlled batches and inspect aggregate label statistics without changing the production model."
        />
      </div>
    </>
  );
}
function Stat({ icon: I, title, value, note }) {
  return (
    <div className="stat">
      <I size={19} />
      <small>{title}</small>
      <strong>{value}</strong>
      <span>{note}</span>
    </div>
  );
}
function Feature({ n, title, text }) {
  return (
    <div className="feature">
      <span>{n}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Analyze() {
  const [text, setText] = useState("");
  const [threshold, setThreshold] = useState(0.5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      setResult(
        await api("/predictions", {
          method: "POST",
          body: JSON.stringify({ text, threshold }),
        }),
      );
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="twoCol">
      <div className="panel composer">
        <div className="panelHead">
          <div>
            <span className="eyebrow">LIVE INFERENCE</span>
            <h2>Analyze a comment</h2>
          </div>
          <span className="modelBadge">BiLSTM · 6 labels</span>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength="10000"
          placeholder="Paste or type a comment here…"
        />
        <div className="composerBottom">
          <span>{text.length.toLocaleString()} / 10,000</span>
          <button className="ghost" onClick={() => setText("")}>
            Clear
          </button>
          <button
            className="primary"
            disabled={loading || !text.trim()}
            onClick={submit}
          >
            {loading ? "Analyzing…" : "Run analysis"}
          </button>
        </div>
        <div className="threshold">
          <div>
            <b>Decision threshold</b>
            <span>{Math.round(threshold * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.95"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
          <small>Higher threshold = fewer labels marked as active.</small>
        </div>
      </div>
      <Result result={result} />
    </div>
  );
}
function Result({ result }) {
  if (!result)
    return (
      <div className="panel empty">
        <div className="emptyIcon">
          <ScanText />
        </div>
        <h3>Your analysis appears here</h3>
        <p>
          Enter a comment and run the model to see six probability scores,
          active labels and an overall risk level.
        </p>
      </div>
    );
  return (
    <div className="panel result">
      <div className="resultTop">
        <div>
          <span className="eyebrow">PREDICTION RESULT</span>
          <h2>
            {result.isToxic
              ? "Potentially harmful"
              : "No active toxicity detected"}
          </h2>
        </div>
        <span className={`risk ${result.riskLevel}`}>{result.riskLevel}</span>
      </div>
      <div className="score">
        <div>
          <b>{Math.round(result.maxScore * 100)}%</b>
          <span>highest score</span>
        </div>
        <div className="meter">
          <i style={{ width: `${result.maxScore * 100}%` }}></i>
        </div>
      </div>
      <div className="labelList">
        {Object.entries(result.probabilities).map(([key, v]) => (
          <div className="labelRow" key={key}>
            <span>{labels[key]}</span>
            <div className="bar">
              <i
                className={v >= result.threshold ? "active" : ""}
                style={{ width: `${v * 100}%` }}
              ></i>
            </div>
            <b>{Math.round(v * 100)}%</b>
          </div>
        ))}
      </div>
      <div className="resultNote">
        <ShieldCheck size={17} />
        <span>
          Scores are model probabilities, not a human judgment. Use the
          threshold to control which labels are flagged.
        </span>
      </div>
    </div>
  );
}

function HistoryPage() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api("/predictions/history")
      .then(setRows)
      .catch(() => {});
  }, []);
  return (
    <div className="panel">
      <div className="panelHead">
        <div>
          <span className="eyebrow">PERSONAL LOG</span>
          <h2>Prediction history</h2>
        </div>
        <span className="count">{rows.length} records</span>
      </div>
      {rows.length === 0 ? (
        <div className="empty small">
          <History />
          <h3>No predictions yet</h3>
          <p>Your analyzed comments will appear here.</p>
        </div>
      ) : (
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Comment</th>
                <th>Risk</th>
                <th>Labels</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td className="commentCell">{r.text}</td>
                  <td>
                    <span className={`risk ${r.riskLevel}`}>{r.riskLevel}</span>
                  </td>
                  <td>
                    {r.labels?.length ? (
                      r.labels.map((x) => (
                        <span className="tag" key={x}>
                          {labels[x]}
                        </span>
                      ))
                    ) : (
                      <span className="muted">None</span>
                    )}
                  </td>
                  <td>{Math.round((r.maxScore || 0) * 100)}%</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Research() {
  const [text, setText] = useState("");
  const [threshold, setThreshold] = useState(0.5);
  const [out, setOut] = useState(null);
  const run = async () => {
    const texts = text
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    if (!texts.length) return;
    try {
      setOut(
        await api("/research/batch", {
          method: "POST",
          body: JSON.stringify({ texts, threshold }),
        }),
      );
    } catch (e) {
      alert(e.message);
    }
  };
  return (
    <>
      <div className="researchIntro">
        <div>
          <span className="pill">RESEARCHER WORKSPACE</span>
          <h1>
            Experiment with <span>real inference.</span>
          </h1>
          <p>
            Run up to 500 comments at once, preserve the same production
            preprocessing, and inspect aggregate outputs.
          </p>
        </div>
        <div className="researchIcon">
          <FlaskConical />
        </div>
      </div>
      <div className="twoCol">
        <div className="panel composer">
          <div className="panelHead">
            <div>
              <span className="eyebrow">BATCH LAB</span>
              <h2>Batch comments</h2>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="One comment per line…"
          />
          <div className="threshold">
            <div>
              <b>Threshold</b>
              <span>{Math.round(threshold * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
            />
          </div>
          <button className="primary" onClick={run}>
            Run batch prediction <FlaskConical size={17} />
          </button>
        </div>
        <div className="panel">
          <span className="eyebrow">BATCH OUTPUT</span>
          {!out ? (
            <div className="empty small">
              <FlaskConical />
              <h3>Waiting for a batch</h3>
              <p>Results and label frequencies will appear here.</p>
            </div>
          ) : (
            <>
              <div className="stats mini">
                <Stat title="Comments" value={out.count} />
                <Stat
                  title="Flagged"
                  value={out.results.filter((x) => x.isToxic).length}
                />
              </div>
              <div className="labelList">
                {out.results.slice(0, 20).map((r, i) => (
                  <div className="batchRow" key={i}>
                    <span>
                      {i + 1}. {r.text}
                    </span>
                    <b>{Math.round(r.maxScore * 100)}%</b>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const load = () =>
    api("/admin/users")
      .then(setUsers)
      .catch((e) => alert(e.message));
  useEffect(load, []);
  const change = async (id, role) => {
    await api(`/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
    load();
  };
  const status = async (id, active) => {
    await api(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ active }),
    });
    load();
  };
  return (
    <div className="panel">
      <div className="panelHead">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h2>User & role management</h2>
        </div>
        <span className="count">{users.length} users</span>
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last login</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>
                  <b>{u.name}</b>
                  <br />
                  <small className="muted">{u.email}</small>
                </td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => change(u._id, e.target.value)}
                  >
                    <option>user</option>
                    <option>researcher</option>
                    <option>admin</option>
                  </select>
                </td>
                <td>
                  <span className={u.active ? "online" : "offline"}>
                    {u.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td>
                  {u.lastLogin
                    ? new Date(u.lastLogin).toLocaleString()
                    : "Never"}
                </td>
                <td>
                  <button
                    className="ghost"
                    onClick={() => status(u._id, !u.active)}
                  >
                    {u.active ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);

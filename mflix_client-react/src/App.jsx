import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API = "http://localhost:3000/api/movies";

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const Spinner = ({ size = 20 }) => (
  <span
    style={{
      display: "inline-block",
      width: size,
      height: size,
      border: `2px solid var(--border)`,
      borderTopColor: "var(--gold)",
      borderRadius: "50%",
      animation: "spin .7s linear infinite",
    }}
  />
);

const Btn = ({
  children,
  onClick,
  variant = "primary",
  disabled,
  style = {},
  type = "button",
}) => {
  const base = {
    padding: "10px 22px",
    borderRadius: 4,
    border: "none",
    font: "500 13px/1 'DM Mono', monospace",
    letterSpacing: ".06em",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "all .18s",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    ...style,
  };
  const variants = {
    primary: { background: "var(--gold)", color: "#0a0a0f" },
    danger: { background: "var(--red)", color: "#fff" },
    ghost: {
      background: "transparent",
      color: "var(--soft)",
      border: "1px solid var(--border)",
    },
    success: { background: "var(--green)", color: "#fff" },
    muted: {
      background: "var(--paper)",
      color: "var(--soft)",
      border: "1px solid var(--border)",
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.filter = "brightness(1.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = "";
      }}
    >
      {children}
    </button>
  );
};

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: 28,
      ...style,
    }}
  >
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label>{label}</label>
    {children}
  </div>
);

const Alert = ({ type = "info", children, onClose }) => {
  const colors = {
    success: { bg: "rgba(76,170,110,.12)", border: "var(--green)", icon: "✓" },
    error: { bg: "rgba(201,76,76,.12)", border: "var(--red)", icon: "✕" },
    info: { bg: "rgba(76,126,201,.12)", border: "var(--accent)", icon: "ℹ" },
  };
  const c = colors[type];
  return (
    <div
      className="fade-up"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 6,
        padding: "14px 18px",
        marginBottom: 20,
        fontFamily: "'DM Mono', monospace",
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      <span style={{ color: c.border, fontWeight: 700 }}>{c.icon}</span>
      <span style={{ flex: 1 }}>{children}</span>
      {onClose && (
        <span
          onClick={onClose}
          style={{ cursor: "pointer", color: "var(--muted)" }}
        >
          ×
        </span>
      )}
    </div>
  );
};

const SectionTitle = ({ label, icon }) => (
  <div
    style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}
  >
    <span style={{ fontSize: 22 }}>{icon}</span>
    <h2
      style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 26,
        fontWeight: 700,
        color: "var(--gold)",
      }}
    >
      {label}
    </h2>
  </div>
);

const JsonBlock = ({ data }) => (
  <pre
    style={{
      background: "var(--ink)",
      border: "1px solid var(--border)",
      borderRadius: 6,
      padding: 18,
      overflowX: "auto",
      fontFamily: "'DM Mono', monospace",
      fontSize: 12,
      lineHeight: 1.7,
      color: "var(--soft)",
      maxHeight: 360,
    }}
  >
    {JSON.stringify(data, null, 2)}
  </pre>
);

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
const PAGES = [
  {
    id: "list",
    label: "Browse",
    method: "GET",
    icon: "🎬",
    desc: "List & filter",
  },
  {
    id: "get",
    label: "Inspect",
    method: "GET",
    icon: "🔍",
    desc: "Find by ID",
  },
  {
    id: "create",
    label: "Create",
    method: "POST",
    icon: "✦",
    desc: "New movie",
  },
  {
    id: "update",
    label: "Update",
    method: "PATCH",
    icon: "✎",
    desc: "Partial edit",
  },
  {
    id: "replace",
    label: "Replace",
    method: "PUT",
    icon: "↺",
    desc: "Full replace",
  },
  {
    id: "delete",
    label: "Delete",
    method: "DELETE",
    icon: "✕",
    desc: "Remove movie",
  },
];

const METHOD_COLORS = {
  GET: "tag-green",
  POST: "tag-blue",
  PATCH: "tag-gold",
  PUT: "tag-blue",
  DELETE: "tag-red",
};

const Sidebar = ({ active, setActive }) => (
  <aside
    style={{
      width: 220,
      flexShrink: 0,
      background: "var(--paper)",
      borderRight: "1px solid var(--border)",
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      height: "100vh",
      overflowY: "auto",
    }}
  >
    {/* Logo */}
    <div
      style={{
        padding: "32px 24px 20px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22,
          fontWeight: 900,
          color: "var(--gold)",
          lineHeight: 1.1,
        }}
      >
        MFLIX
      </div>
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          letterSpacing: ".15em",
          color: "var(--muted)",
          marginTop: 4,
        }}
      >
        CRUD MANAGER
      </div>
    </div>

    {/* Nav items */}
    <nav style={{ padding: "16px 12px", flex: 1 }}>
      {PAGES.map((p) => (
        <button
          key={p.id}
          onClick={() => setActive(p.id)}
          style={{
            width: "100%",
            textAlign: "left",
            background: active === p.id ? "rgba(201,168,76,.1)" : "transparent",
            border:
              active === p.id
                ? "1px solid rgba(201,168,76,.3)"
                : "1px solid transparent",
            borderRadius: 6,
            padding: "10px 12px",
            cursor: "pointer",
            marginBottom: 4,
            transition: "all .15s",
          }}
          onMouseEnter={(e) => {
            if (active !== p.id)
              e.currentTarget.style.background = "rgba(255,255,255,.03)";
          }}
          onMouseLeave={(e) => {
            if (active !== p.id)
              e.currentTarget.style.background = "transparent";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>{p.icon}</span>
            <div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  fontWeight: 500,
                  color: active === p.id ? "var(--gold)" : "var(--text)",
                }}
              >
                {p.label}
              </div>
              <div
                style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}
              >
                <span
                  className={`tag ${METHOD_COLORS[p.method]}`}
                  style={{ padding: "1px 6px", fontSize: 9 }}
                >
                  {p.method}
                </span>{" "}
                {p.desc}
              </div>
            </div>
          </div>
        </button>
      ))}
    </nav>

    <div
      style={{
        padding: "16px 24px",
        borderTop: "1px solid var(--border)",
        fontSize: 11,
        fontFamily: "'DM Mono', monospace",
        color: "var(--muted)",
      }}
    >
      sample_mflix
      <br />
      <span style={{ color: "var(--border)" }}>→ movies</span>
    </div>
  </aside>
);

// ─── Movie Card (list display) ────────────────────────────────────────────────
const MovieCard = ({ movie, onSelect }) => (
  <div
    className="fade-up"
    onClick={() => onSelect && onSelect(movie._id)}
    style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      overflow: "hidden",
      cursor: onSelect ? "pointer" : "default",
      transition: "border-color .2s, transform .2s",
      display: "flex",
      gap: 0,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "rgba(201,168,76,.4)";
      e.currentTarget.style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--border)";
      e.currentTarget.style.transform = "";
    }}
  >
    {movie.poster && (
      <img
        src={movie.poster}
        alt={movie.title}
        style={{ width: 80, objectFit: "cover", flexShrink: 0 }}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    )}
    <div style={{ padding: "14px 16px", flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 15,
          fontWeight: 700,
          color: "var(--gold2)",
          marginBottom: 4,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {movie.title}
      </div>
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}
      >
        {movie.year && <span className="tag">{movie.year}</span>}
        {movie.rated && <span className="tag tag-gold">{movie.rated}</span>}
        {(movie.genres || []).slice(0, 2).map((g) => (
          <span key={g} className="tag">
            {g}
          </span>
        ))}
        {movie.imdb?.rating && (
          <span className="tag tag-green">★ {movie.imdb.rating}</span>
        )}
      </div>
      <p
        style={{
          fontSize: 12,
          color: "var(--muted)",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {movie.plot}
      </p>
      <div
        style={{
          marginTop: 8,
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color: "var(--border)",
        }}
      >
        {String(movie._id)}
      </div>
    </div>
  </div>
);

// ─── PAGE: Browse / List (GET /api/movies) ────────────────────────────────────
const PageList = ({ navigate }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [params, setParams] = useState({
    page: "1",
    limit: "10",
    title: "",
    genre: "",
    year: "",
    rated: "",
  });

  const p = (k) => (e) =>
    setParams((prev) => ({ ...prev, [k]: e.target.value }));

  const fetch_ = useCallback(async () => {
    setLoading(true);
    setError("");
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    try {
      const r = await fetch(`${API}?${qs}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || r.statusText);
      setResult(d);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [params]);

  useEffect(() => {
    fetch_();
  }, []);

  return (
    <div className="fade-up">
      <SectionTitle label="Browse Movies" icon="🎬" />

      <Card style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 14,
            marginBottom: 16,
          }}
        >
          {[
            { k: "title", label: "Title (partial)" },
            { k: "genre", label: "Genre" },
            { k: "year", label: "Year" },
            { k: "rated", label: "Rated (PG, R…)" },
            { k: "page", label: "Page" },
            { k: "limit", label: "Limit (max 50)" },
          ].map(({ k, label }) => (
            <Field key={k} label={label}>
              <input value={params[k]} onChange={p(k)} placeholder={label} />
            </Field>
          ))}
        </div>
        <Btn onClick={fetch_} disabled={loading}>
          {loading ? <Spinner size={14} /> : "⌕"} Search
        </Btn>
      </Card>

      {error && (
        <Alert type="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {result && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                color: "var(--muted)",
              }}
            >
              {result.total.toLocaleString()} results — page {result.page} /{" "}
              {result.totalPages}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {result.page > 1 && (
                <Btn
                  variant="ghost"
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      page: String(Number(prev.page) - 1),
                    }));
                    setTimeout(fetch_, 50);
                  }}
                >
                  ← Prev
                </Btn>
              )}
              {result.page < result.totalPages && (
                <Btn
                  variant="ghost"
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      page: String(Number(prev.page) + 1),
                    }));
                    setTimeout(fetch_, 50);
                  }}
                >
                  Next →
                </Btn>
              )}
            </div>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {result.data.map((m) => (
              <MovieCard
                key={String(m._id)}
                movie={m}
                onSelect={(id) => navigate("get", id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── PAGE: Get by ID (GET /api/movies/:id) ────────────────────────────────────
const PageGet = ({ prefillId }) => {
  const [id, setId] = useState(prefillId || "");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetch_ = async () => {
    if (!id.trim()) return setError("Please enter a movie ID.");
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch(`${API}/${id.trim()}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || r.statusText);
      setResult(d);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (prefillId) fetch_();
  }, [prefillId]);

  return (
    <div className="fade-up">
      <SectionTitle label="Inspect Movie" icon="🔍" />
      <Card style={{ marginBottom: 24 }}>
        <Field label="Movie ObjectId">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="573a1398f29313caabce9682"
            onKeyDown={(e) => e.key === "Enter" && fetch_()}
          />
        </Field>
        <Btn onClick={fetch_} disabled={loading}>
          {loading ? <Spinner size={14} /> : "→"} Fetch
        </Btn>
      </Card>

      {error && (
        <Alert type="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {result && (
        <div className="fade-up">
          <MovieCard movie={result} />
          <Card style={{ marginTop: 16 }}>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: "var(--muted)",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: ".1em",
              }}
            >
              Raw Document
            </div>
            <JsonBlock data={result} />
          </Card>
        </div>
      )}
    </div>
  );
};

// ─── Movie form (shared by create / update / replace) ─────────────────────────
const EMPTY_MOVIE = {
  title: "",
  year: "",
  runtime: "",
  rated: "",
  plot: "",
  genres: "",
  cast: "",
  directors: "",
  writers: "",
  languages: "",
  countries: "",
  type: "movie",
  poster: "",
};

const MovieForm = ({ initial = EMPTY_MOVIE, onChange }) => {
  const [v, setV] = useState(initial);
  const s = (k) => (e) => {
    const next = { ...v, [k]: e.target.value };
    setV(next);
    onChange(next);
  };

  const textFields = [
    { k: "title", label: "Title *", span: 2 },
    { k: "plot", label: "Plot", span: 2, area: true },
    { k: "year", label: "Year" },
    { k: "runtime", label: "Runtime (min)" },
    { k: "rated", label: "Rated (PG, R…)" },
    { k: "type", label: "Type" },
    { k: "genres", label: "Genres (comma-sep)", span: 2 },
    { k: "cast", label: "Cast (comma-sep)", span: 2 },
    { k: "directors", label: "Directors (comma-sep)", span: 2 },
    { k: "writers", label: "Writers (comma-sep)", span: 2 },
    { k: "languages", label: "Languages (comma-sep)", span: 1 },
    { k: "countries", label: "Countries (comma-sep)", span: 1 },
    { k: "poster", label: "Poster URL", span: 2 },
  ];

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}
    >
      {textFields.map(({ k, label, span = 1, area }) => (
        <div key={k} style={{ gridColumn: `span ${span}`, marginBottom: 16 }}>
          <label>{label}</label>
          {area ? (
            <textarea value={v[k]} onChange={s(k)} placeholder={label} />
          ) : (
            <input value={v[k]} onChange={s(k)} placeholder={label} />
          )}
        </div>
      ))}
    </div>
  );
};

// helper – turn comma strings → arrays
function formToPayload(v) {
  const split = (s) =>
    s
      ? s
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean)
      : undefined;
  return {
    ...(v.title && { title: v.title }),
    ...(v.plot && { plot: v.plot }),
    ...(v.year && { year: parseInt(v.year) }),
    ...(v.runtime && { runtime: parseInt(v.runtime) }),
    ...(v.rated && { rated: v.rated }),
    ...(v.type && { type: v.type }),
    ...(v.poster && { poster: v.poster }),
    ...(v.genres && { genres: split(v.genres) }),
    ...(v.cast && { cast: split(v.cast) }),
    ...(v.directors && { directors: split(v.directors) }),
    ...(v.writers && { writers: split(v.writers) }),
    ...(v.languages && { languages: split(v.languages) }),
    ...(v.countries && { countries: split(v.countries) }),
  };
}

// ─── PAGE: Create (POST /api/movies) ─────────────────────────────────────────
const PageCreate = () => {
  const [form, setForm] = useState(EMPTY_MOVIE);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!form.title) return setError("Title is required.");
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || r.statusText);
      setResult(d);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fade-up">
      <SectionTitle label="Create Movie" icon="✦" />
      <Card>
        <MovieForm initial={EMPTY_MOVIE} onChange={setForm} />
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 20,
            marginTop: 4,
          }}
        >
          <Btn onClick={submit} disabled={loading} variant="success">
            {loading ? <Spinner size={14} /> : "+"} Create Movie
          </Btn>
        </div>
      </Card>

      {error && (
        <Alert
          type="error"
          onClose={() => setError("")}
          style={{ marginTop: 16 }}
        >
          {error}
        </Alert>
      )}
      {result && (
        <Card style={{ marginTop: 16 }} className="fade-up">
          <Alert type="success">
            Movie created! ID: <strong>{String(result.insertedId)}</strong>
          </Alert>
          <JsonBlock data={result} />
        </Card>
      )}
    </div>
  );
};

// ─── PAGE: Update (PATCH /api/movies/:id) ────────────────────────────────────
const PageUpdate = () => {
  const [id, setId] = useState("");
  const [form, setForm] = useState(EMPTY_MOVIE);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!id.trim()) return setError("Movie ID is required.");
    const payload = formToPayload(form);
    if (!Object.keys(payload).length)
      return setError("At least one field is required.");
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch(`${API}/${id.trim()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || r.statusText);
      setResult(d);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fade-up">
      <SectionTitle label="Update Movie" icon="✎" />
      <Card style={{ marginBottom: 16 }}>
        <Field label="Movie ObjectId *">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="573a1398f29313caabce9682"
          />
        </Field>
      </Card>
      <Card>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: "var(--muted)",
            marginBottom: 16,
          }}
        >
          Fill only the fields you want to update — empty fields are ignored.
        </div>
        <MovieForm initial={EMPTY_MOVIE} onChange={setForm} />
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
          <Btn onClick={submit} disabled={loading} variant="primary">
            {loading ? <Spinner size={14} /> : "✎"} Patch Movie
          </Btn>
        </div>
      </Card>

      {error && (
        <Alert type="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {result && (
        <Card style={{ marginTop: 16 }}>
          <Alert type="success">
            {result.message} ({result.modifiedCount} modified)
          </Alert>
          <JsonBlock data={result} />
        </Card>
      )}
    </div>
  );
};

// ─── PAGE: Replace (PUT /api/movies/:id) ─────────────────────────────────────
const PageReplace = () => {
  const [id, setId] = useState("");
  const [form, setForm] = useState(EMPTY_MOVIE);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);

  const submit = async () => {
    if (!id.trim()) return setError("Movie ID is required.");
    if (!form.title)
      return setError("Title is required for a full replacement.");
    if (!confirm) return setConfirm(true);
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const r = await fetch(`${API}/${id.trim()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToPayload(form)),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || r.statusText);
      setResult(d);
      setConfirm(false);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fade-up">
      <SectionTitle label="Replace Movie" icon="↺" />
      <Alert type="info">
        PUT performs a <strong>full replacement</strong>. All existing fields
        not included will be removed from the document.
      </Alert>
      <Card style={{ marginBottom: 16 }}>
        <Field label="Movie ObjectId *">
          <input
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setConfirm(false);
            }}
            placeholder="573a1398f29313caabce9682"
          />
        </Field>
      </Card>
      <Card>
        <MovieForm
          initial={EMPTY_MOVIE}
          onChange={(v) => {
            setForm(v);
            setConfirm(false);
          }}
        />
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 20,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          {!confirm ? (
            <Btn onClick={submit} disabled={loading} variant="primary">
              {loading ? <Spinner size={14} /> : "↺"} Replace Movie
            </Btn>
          ) : (
            <>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  color: "var(--red)",
                }}
              >
                ⚠ Confirm full replacement?
              </span>
              <Btn onClick={submit} disabled={loading} variant="danger">
                Yes, Replace
              </Btn>
              <Btn onClick={() => setConfirm(false)} variant="ghost">
                Cancel
              </Btn>
            </>
          )}
        </div>
      </Card>

      {error && (
        <Alert type="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {result && (
        <Card style={{ marginTop: 16 }}>
          <Alert type="success">{result.message}</Alert>
          <JsonBlock data={result} />
        </Card>
      )}
    </div>
  );
};

// ─── PAGE: Delete (DELETE /api/movies/:id) ────────────────────────────────────
const PageDelete = () => {
  const [id, setId] = useState("");
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingDel, setLoadingDel] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);

  const fetchPreview = async () => {
    if (!id.trim()) return setError("Enter a movie ID first.");
    setLoadingPreview(true);
    setError("");
    setPreview(null);
    setConfirm(false);
    try {
      const r = await fetch(`${API}/${id.trim()}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || r.statusText);
      setPreview(d);
    } catch (e) {
      setError(e.message);
    }
    setLoadingPreview(false);
  };

  const del = async () => {
    setLoadingDel(true);
    setError("");
    try {
      const r = await fetch(`${API}/${id.trim()}`, { method: "DELETE" });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || r.statusText);
      setResult(d);
      setPreview(null);
      setConfirm(false);
      setId("");
    } catch (e) {
      setError(e.message);
    }
    setLoadingDel(false);
  };

  return (
    <div className="fade-up">
      <SectionTitle label="Delete Movie" icon="✕" />

      <Card style={{ marginBottom: 24 }}>
        <Field label="Movie ObjectId">
          <input
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setPreview(null);
              setConfirm(false);
              setResult(null);
            }}
            placeholder="573a1398f29313caabce9682"
            onKeyDown={(e) => e.key === "Enter" && fetchPreview()}
          />
        </Field>
        <Btn onClick={fetchPreview} disabled={loadingPreview} variant="ghost">
          {loadingPreview ? <Spinner size={14} /> : "🔍"} Preview
        </Btn>
      </Card>

      {error && (
        <Alert type="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {result && (
        <Alert type="success" onClose={() => setResult(null)}>
          {result.message}
        </Alert>
      )}

      {preview && (
        <div className="fade-up">
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "var(--red)",
              textTransform: "uppercase",
              letterSpacing: ".12em",
              marginBottom: 12,
            }}
          >
            ⚠ This movie will be permanently deleted:
          </div>
          <MovieCard movie={preview} />

          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            {!confirm ? (
              <Btn onClick={() => setConfirm(true)} variant="danger">
                Delete Movie
              </Btn>
            ) : (
              <>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 12,
                    color: "var(--red)",
                  }}
                >
                  Are you absolutely sure?
                </span>
                <Btn onClick={del} disabled={loadingDel} variant="danger">
                  {loadingDel ? <Spinner size={14} /> : "✕"} Yes, Delete
                  Permanently
                </Btn>
                <Btn onClick={() => setConfirm(false)} variant="ghost">
                  Cancel
                </Btn>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── App shell ────────────────────────────────────────────────────────────────
function App() {
  const [active, setActive] = useState("list");
  const [prefillId, setPrefillId] = useState("");

  const navigate = (page, id = "") => {
    setPrefillId(id);
    setActive(page);
  };

  const pages = {
    list: <PageList navigate={navigate} />,
    get: <PageGet prefillId={prefillId} />,
    create: <PageCreate />,
    update: <PageUpdate />,
    replace: <PageReplace />,
    delete: <PageDelete />,
  };

  return (
    <>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar
          active={active}
          setActive={(p) => {
            setPrefillId("");
            setActive(p);
          }}
        />
        <main
          style={{
            flex: 1,
            padding: "40px 48px",
            maxWidth: 900,
            overflowY: "auto",
          }}
        >
          {pages[active]}
        </main>
      </div>
    </>
  );
}

export default App;

import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = "http://localhost:5000";
// const API_BASE = "https://YOUR_USERNAME-likemindswizard-backend.hf.space";

const BRAND = {
  primary: "#2979FF", primaryLight: "#64A8FF", primaryGlow: "#2979FF28",
  accent: "#FF6B9D", accentGlow: "#FF6B9D28",
  pink: "#FF6B9D", pinkLight: "#FFB3CC", pinkGlow: "#FF6B9D20",
  green: "#00BFA5", gold: "#FF8C42", purple: "#845EF7", red: "#FF5370",
  bg: "#EDF5FF", surface: "#FFFFFF", surfaceHover: "#FFF0F6",
  border: "#B8D8FF", borderHover: "#FF9EC3",
  text: "#0A2540", muted: "#4F7099", subtle: "#DFF0FF",
};

const GRAPH_POSITIONS = [
  { x: 75, y: 25 }, { x: 80, y: 65 }, { x: 50, y: 82 }, { x: 20, y: 65 }, { x: 22, y: 28 },
];

const TONE_OPTIONS = [
  { id: "friendly",  label: "Friendly",  desc: "Warm, casual, approachable",       color: BRAND.green  },
  { id: "formal",    label: "Formal",    desc: "Professional, measured, concise",   color: BRAND.primary },
  { id: "bold",      label: "Bold",      desc: "Direct, confident, punchy",         color: BRAND.accent },
];

// ─── API HELPERS ───────────────────────────────────────────────────────────────
async function apiBuildProfile(data) {
  const res = await fetch(`${API_BASE}/profile`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Profile build failed");
  return json.profile;
}

async function apiSearchPeople(query, userProfile) {
  const res = await fetch(`${API_BASE}/search`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, user_profile: userProfile }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Search failed");
  return json.profiles;
}

async function apiGenerateMessage(userProfile, targetProfile, tone = "friendly") {
  const res = await fetch(`${API_BASE}/message`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_profile: userProfile, target_profile: targetProfile, tone }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Message generation failed");
  return json.message;
}

async function apiDeepResearch(profile) {
  const res = await fetch(`${API_BASE}/research`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Research failed");
  return json.research;
}

// ─── PROFILE AVATAR ────────────────────────────────────────────────────────────
function ProfileAvatar({ profile, size = 38, selected = false, hovered = false }) {
  const s = hovered ? size * 1.16 : size;
  const c = s / 2;
  const color = profile.color || BRAND.primary;
  const initials = profile.avatar || "??";
  const shapeIndex = ((profile.id || 1) - 1) % 8;

  const shapes = [
    () => { const pts = Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i - Math.PI / 6; return `${c + c * 0.72 * Math.cos(a)},${c + c * 0.72 * Math.sin(a)}`; }).join(" "); return <polygon points={pts} fill={selected ? color : "none"} stroke={color} strokeWidth={selected ? 0 : 2} />; },
    () => { const r = c * 0.72; return <polygon points={`${c},${c-r} ${c+r},${c} ${c},${c+r} ${c-r},${c}`} fill={selected ? color : "none"} stroke={color} strokeWidth={selected ? 0 : 2} />; },
    () => { const r = c * 0.76; return <polygon points={`${c},${c-r} ${c+r*0.87},${c+r*0.5} ${c-r*0.87},${c+r*0.5}`} fill={selected ? color : "none"} stroke={color} strokeWidth={selected ? 0 : 2} />; },
    () => { const o = c*0.72, inn = c*0.34; const pts = Array.from({length:8},(_,i)=>{const a=(Math.PI/4)*i-Math.PI/2;const r=i%2===0?o:inn;return `${c+r*Math.cos(a)},${c+r*Math.sin(a)}`;}).join(" "); return <polygon points={pts} fill={selected ? color : "none"} stroke={color} strokeWidth={selected ? 0 : 2} />; },
    () => { const pts = Array.from({length:5},(_,i)=>{const a=(2*Math.PI/5)*i-Math.PI/2;return `${c+c*0.72*Math.cos(a)},${c+c*0.72*Math.sin(a)}`;}).join(" "); return <polygon points={pts} fill={selected ? color : "none"} stroke={color} strokeWidth={selected ? 0 : 2} />; },
    () => { const w=c*0.68,h=c*0.76; return <polygon points={`${c},${c+h} ${c-w},${c} ${c-w},${c-h*0.5} ${c},${c-h} ${c+w},${c-h*0.5} ${c+w},${c}`} fill={selected ? color : "none"} stroke={color} strokeWidth={selected ? 0 : 2} />; },
    () => { const r2=c*0.64,rx=r2*0.32; return <rect x={c-r2} y={c-r2} width={r2*2} height={r2*2} rx={rx} fill={selected ? color : "none"} stroke={color} strokeWidth={selected ? 0 : 2} />; },
    () => (<><circle cx={c} cy={c} r={c*0.68} fill={selected ? color : "none"} stroke={color} strokeWidth={selected ? 0 : 2} /><circle cx={c} cy={c} r={c*0.38} fill="none" stroke={color} strokeWidth={1.2} opacity={0.5} /></>),
  ];

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ flexShrink: 0, transition: "all 0.2s", display: "block" }}>
      {shapes[shapeIndex]()}
      <text x={c} y={c} dominantBaseline="central" textAnchor="middle" fontSize={s * 0.3} fontWeight="700" fontFamily="'Space Mono', monospace" fill={selected ? "#fff" : color} style={{ userSelect: "none" }}>
        {initials}
      </text>
    </svg>
  );
}

// ─── SHARED UI ─────────────────────────────────────────────────────────────────
function NexusInput({ label, value, onChange, placeholder, type = "input", rows = 3 }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: "100%", background: BRAND.surface,
    border: `1px solid ${focused ? BRAND.pink : BRAND.border}`,
    borderRadius: 10, padding: "12px 16px", color: BRAND.text,
    fontSize: 14, fontFamily: "'Space Mono', monospace", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: focused ? `0 0 0 3px ${BRAND.pinkGlow}` : "none",
  };
  return (
    <div>
      {label && <label style={{ display: "block", fontSize: 11, letterSpacing: 2, color: BRAND.muted, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", marginBottom: 6 }}>{label}</label>}
      {type === "textarea"
        ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ ...base, resize: "vertical" }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        : <input value={value} onChange={onChange} placeholder={placeholder} style={base} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />}
    </div>
  );
}

function NexusButton({ children, onClick, disabled, loading, color, textColor, style = {} }) {
  const [hovered, setHovered] = useState(false);
  const bg = color || BRAND.primary;
  const isDisabled = disabled || loading;
  return (
    <button onClick={onClick} disabled={isDisabled}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        padding: "13px 28px", background: isDisabled ? BRAND.subtle : hovered ? bg + "dd" : bg,
        border: "none", borderRadius: 10, color: isDisabled ? BRAND.muted : (textColor || "#fff"),
        fontSize: 14, fontWeight: 700, cursor: isDisabled ? "not-allowed" : "pointer",
        fontFamily: "'Syne', sans-serif", letterSpacing: 0.5,
        transform: hovered && !isDisabled ? "translateY(-1px)" : "none",
        boxShadow: hovered && !isDisabled ? `0 6px 24px ${bg}55` : "none",
        transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8, ...style,
      }}>
      {loading && <span style={{ width: 14, height: 14, border: `2px solid ${(textColor || "#fff")}44`, borderTopColor: textColor || "#fff", borderRadius: "50%", display: "inline-block", animation: "nexusSpin 0.7s linear infinite" }} />}
      {children}
    </button>
  );
}

function StepChip({ number, label, color }) {
  return (
    <div style={{ marginBottom: 16 }} className="step-chip">
      <span style={{ fontSize: 10, letterSpacing: 4, color, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", borderLeft: `2px solid ${color}`, paddingLeft: 8, paddingRight: 8, animation: `fadeSlideLeft 0.5s both` }}>
        {String(number).padStart(2, "0")} / {label}
      </span>
    </div>
  );
}

function NexusLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke={BRAND.primary} strokeWidth="1.5" />
      <circle cx="16" cy="8"  r="3"  fill={BRAND.primaryLight} />
      <circle cx="24" cy="21" r="3"  fill={BRAND.pink} />
      <circle cx="8"  cy="21" r="3"  fill={BRAND.gold} />
      <line x1="16" y1="8"  x2="24" y2="21" stroke={BRAND.primary} strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="16" y1="8"  x2="8"  y2="21" stroke={BRAND.primary} strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="24" y1="21" x2="8"  y2="21" stroke={BRAND.primary} strokeWidth="1.2" strokeOpacity="0.6" />
      <circle cx="16" cy="16" r="2.5" fill={BRAND.primary} opacity="0.5" />
    </svg>
  );
}

function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{ padding: "12px 16px", background: "#FFF0F0", border: `1px solid ${BRAND.red}44`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: BRAND.red, fontFamily: "'Space Mono', monospace", marginBottom: 20 }}>
      <span>⚠ {message}</span>
      <button onClick={onDismiss} style={{ background: "none", border: "none", color: BRAND.red, cursor: "pointer", fontSize: 16 }}>×</button>
    </div>
  );
}

// Animated score bar shown in graph step cards
function MatchBar({ score, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(score), 120); return () => clearTimeout(t); }, [score]);
  return (
    <div style={{ marginTop: 6, height: 3, background: BRAND.subtle, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${width}%`, background: color, borderRadius: 2, transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }} />
    </div>
  );
}

// ─── STEP: HERO ────────────────────────────────────────────────────────────────
function HeroStep({ onStart }) {
  const [animIn, setAnimIn] = useState(false);
  const [titleDone, setTitleDone] = useState(false);
  useEffect(() => {
    setTimeout(() => setAnimIn(true), 80);
    setTimeout(() => setTitleDone(true), 900);
  }, []);
  return (
    <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(32px)", transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)" }}>
      {/* Logo with pulse ring */}
      <div style={{ marginBottom: 28, position: "relative", display: "inline-block" }}>
        <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `1.5px solid ${BRAND.primary}44`, animation: "pulseRing 2.4s ease-out infinite" }} />
        <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: `1px solid ${BRAND.pink}22`, animation: "pulseRing 2.4s ease-out infinite 0.6s" }} />
        <NexusLogo size={64} />
      </div>

      {/* Animated shimmer headline */}
      <h1 className="shimmer-text" style={{ fontSize: "clamp(48px, 9vw, 96px)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1, margin: 0, marginBottom: 8, letterSpacing: -2 }}>
        Nexus
      </h1>

      {/* Typewriter subtitle */}
      <p style={{ fontSize: "clamp(14px, 2.5vw, 20px)", color: BRAND.primaryLight, fontFamily: "'Space Mono', monospace", marginBottom: 20, letterSpacing: 2, display: "inline-block" }}>
        <span className={titleDone ? "typewriter" : ""}>find your people</span>
      </p>

      <p style={{ fontSize: 15, color: BRAND.muted, maxWidth: 460, lineHeight: 1.7, marginBottom: 40, fontFamily: "'Syne', sans-serif", animation: "fadeSlideUp 0.8s 0.4s both" }}>
        Paste your social links. Describe who you're looking for. Nexus builds your semantic profile, discovers real matching people, and automates personalized outreach — end to end.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 48, animation: "fadeSlideUp 0.7s 0.6s both" }}>
        <NexusButton onClick={onStart} color={BRAND.primary} textColor="#000" style={{ fontSize: 15, padding: "14px 36px" }} className="mag-btn">Get Started →</NexusButton>
        <button className="mag-btn" style={{ padding: "14px 28px", background: "transparent", border: `1px solid ${BRAND.border}`, borderRadius: 10, color: "#000", fontSize: 14, cursor: "pointer", fontFamily: "'Syne', sans-serif", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND.primary; e.currentTarget.style.color = BRAND.primary; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.color = "#000"; }}>
          See how it works
        </button>
      </div>

      {/* Staggered feature chips */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { icon: "◎", label: "Semantic Profile", color: BRAND.green   },
          { icon: "⬡", label: "Graph Discovery",  color: BRAND.primary },
          { icon: "✦", label: "AI Outreach",       color: BRAND.accent  },
          { icon: "⟳", label: "Auto-Track",        color: BRAND.gold    },
        ].map(({ icon, label, color }, i) => (
          <div key={label}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 18px", background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 20, fontSize: 12, color: BRAND.muted, fontFamily: "'Space Mono', monospace", animation: `fadeSlideUp 0.5s ${0.7 + i * 0.1}s both`, cursor: "default", transition: "border-color 0.2s, color 0.2s, transform 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.color = BRAND.muted; e.currentTarget.style.transform = "translateY(0)"; }}>
            <span style={{ color, animation: `letterFloat ${2 + i * 0.4}s ease-in-out infinite`, display: "inline-block" }}>{icon}</span> {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STEP 1: PROFILE ──────────────────────────────────────────────────────────
function ProfileStep({ data, setData, onNext, setUserProfile }) {
  const [animIn, setAnimIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);

  const handleNext = async () => {
    setError(null); setLoading(true);
    try { const profile = await apiBuildProfile(data); setUserProfile(profile); onNext(); }
    catch (err) { setError(err.message || "Could not build profile. Check that the backend is running."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
      <StepChip number={1} label="Profile" color={BRAND.green} />
      <h2 className="shimmer-text" style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.1, margin: 0, marginBottom: 10, animation: "fadeSlideUp 0.6s 0.1s both" }}>Tell us who you are</h2>
      <p style={{ color: BRAND.muted, fontSize: 15, marginBottom: 36, maxWidth: 480, animation: "fadeSlideUp 0.6s 0.2s both" }}>Paste your social links. Nexus uses Gemini + Tavily to build a real semantic fingerprint.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 520 }}>
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
        {[
          { label: "LinkedIn URL",                key: "linkedin", placeholder: "https://linkedin.com/in/yourname" },
          { label: "GitHub URL",                  key: "github",   placeholder: "https://github.com/yourname" },
          { label: "Twitter / X URL",             key: "twitter",  placeholder: "https://x.com/yourname" },
          { label: "Personal Website (optional)", key: "website",  placeholder: "https://yoursite.com" },
        ].map(({ label, key, placeholder }) => (
          <NexusInput key={key} label={label} value={data[key] || ""} onChange={e => setData({ ...data, [key]: e.target.value })} placeholder={placeholder} />
        ))}
        <NexusInput label="Short Bio (optional)" value={data.bio || ""} onChange={e => setData({ ...data, bio: e.target.value })} placeholder="2nd year student at UCL, interested in sim-to-real transfer..." type="textarea" />
        <NexusButton onClick={handleNext} loading={loading} color={BRAND.green} textColor="#fff" style={{ alignSelf: "flex-start" }}>
          {loading ? "Building Profile..." : "Build My Profile →"}
        </NexusButton>
      </div>
    </div>
  );
}

// ─── STEP 2: SEARCH ───────────────────────────────────────────────────────────
function SearchStep({ onNext, setProfiles, userProfile }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [animIn, setAnimIn] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);

  const PHASES = ["Analyzing your semantic fingerprint...", "Searching LinkedIn, GitHub, Twitter...", "Computing similarity scores...", "Ranking your top matches..."];

  const handleSearch = async () => {
    if (!query.trim()) return;
    setError(null); setLoading(true); setPhase(0);
    let phaseIndex = 0;
    const cycle = setInterval(() => { phaseIndex++; if (phaseIndex < PHASES.length) setPhase(phaseIndex); else clearInterval(cycle); }, 900);
    try {
      const profiles = await apiSearchPeople(query, userProfile);
      clearInterval(cycle); setPhase(PHASES.length - 1);
      setTimeout(() => { setProfiles(profiles.length > 0 ? profiles : []); onNext(); }, 500);
    } catch (err) { clearInterval(cycle); setLoading(false); setError(err.message || "Search failed. Check the backend is running."); }
  };

  const SUGGESTIONS = ["ML researchers at UCL who published at ICRA 2024", "AI engineers working on robotics in London", "PhD students interested in sim-to-real transfer", "Open source contributors in the Agno community"];

  return (
    <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
      <StepChip number={2} label="Discover" color={BRAND.gold} />
      <h2 className="shimmer-text" style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.1, margin: 0, marginBottom: 10, animation: "fadeSlideUp 0.6s 0.1s both" }}>Who are you looking for?</h2>
      <p style={{ color: BRAND.muted, fontSize: 15, marginBottom: 36, maxWidth: 480, animation: "fadeSlideUp 0.6s 0.2s both" }}>Describe in plain English. Nexus turns your words into a live multi-platform search via Tavily.</p>
      {!loading ? (
        <div style={{ maxWidth: 560 }}>
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
          <NexusInput value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. ML researchers at UCL who submitted papers at ICRA..." type="textarea" rows={3} />
          <div style={{ margin: "16px 0 24px" }}>
            <div style={{ fontSize: 10, color: BRAND.muted, letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 10 }}>Try these</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setQuery(s)} style={{ background: "transparent", border: `1px solid ${BRAND.border}`, borderRadius: 20, padding: "6px 14px", color: BRAND.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.target.style.borderColor = BRAND.accent; e.target.style.color = BRAND.accent; }}
                  onMouseLeave={e => { e.target.style.borderColor = BRAND.border; e.target.style.color = BRAND.muted; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <NexusButton onClick={handleSearch} disabled={!query.trim()} color={BRAND.gold} textColor="#fff">Search →</NexusButton>
        </div>
      ) : (
        <div style={{ maxWidth: 400 }}>
          {PHASES.map((p, i) => (
            <div key={p} style={{ display: "flex", alignItems: "center", gap: 14, padding: "11px 0", opacity: i <= phase ? 1 : 0.18, transition: "opacity 0.4s" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: i < phase ? BRAND.green : i === phase ? BRAND.gold : BRAND.subtle, boxShadow: i === phase ? `0 0 14px ${BRAND.gold}` : "none", transition: "all 0.4s" }} />
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: i === phase ? BRAND.text : i < phase ? BRAND.green : BRAND.muted }}>{i < phase ? "✓ " : ""}{p}</span>
            </div>
          ))}
          <div style={{ marginTop: 24, height: 2, background: BRAND.surface, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.purple})`, width: `${((phase + 1) / PHASES.length) * 100}%`, transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STEP 3: GRAPH ────────────────────────────────────────────────────────────
function GraphStep({ profiles, selected, setSelected, onNext }) {
  const [animIn, setAnimIn] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [expanded, setExpanded] = useState(null);   // deep-research panel
  const [research, setResearch] = useState({});
  const [researching, setResearching] = useState({});
  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);
  const cx = 50, cy = 50;
  const display = profiles.slice(0, 5);

  const handleResearch = async (p) => {
    if (research[p.id]) { setExpanded(expanded === p.id ? null : p.id); return; }
    setResearching(prev => ({ ...prev, [p.id]: true }));
    setExpanded(p.id);
    try { const r = await apiDeepResearch(p); setResearch(prev => ({ ...prev, [p.id]: r })); }
    catch { setResearch(prev => ({ ...prev, [p.id]: { background: "Research unavailable.", achievements: [], research_focus: p.tags?.[0] || "—", notable_work: "—", why_connect: p.match_reason || "—" } })); }
    finally { setResearching(prev => ({ ...prev, [p.id]: false })); }
  };

  return (
    <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
      <StepChip number={3} label="Graph" color={BRAND.purple} />
      <h2 className="shimmer-text" style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.1, margin: 0, marginBottom: 8, animation: "fadeSlideUp 0.6s 0.1s both" }}>Your semantic network</h2>
      <p style={{ color: BRAND.muted, fontSize: 14, marginBottom: 28 }}>{display.length} real matches found. Select who to reach out to — or deep-research anyone first.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Graph canvas */}
        <div style={{ position: "relative", aspectRatio: "1", background: BRAND.surface, borderRadius: 16, border: `1px solid ${BRAND.border}`, overflow: "hidden" }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.06 }}>
            {[20, 40, 60, 80].map(v => (<g key={v}><line x1={`${v}%`} y1="0" x2={`${v}%`} y2="100%" stroke={BRAND.primaryLight} strokeWidth="1" /><line x1="0" y1={`${v}%`} x2="100%" y2={`${v}%`} stroke={BRAND.primaryLight} strokeWidth="1" /></g>))}
          </svg>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {GRAPH_POSITIONS.map((pos, i) => (<line key={i} x1={`${cx}%`} y1={`${cy}%`} x2={`${pos.x}%`} y2={`${pos.y}%`} stroke={display[i]?.color || BRAND.subtle} strokeWidth="1" strokeOpacity={selected.includes(display[i]?.id) ? 0.6 : 0.14} strokeDasharray="4 4" />))}
          </svg>
          <div style={{ position: "absolute", left: `${cx}%`, top: `${cy}%`, transform: "translate(-50%,-50%)", zIndex: 10 }}>
            <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `1.5px solid ${BRAND.primary}44`, animation: "pulseRing 2s ease-out infinite" }} />
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#fff", fontFamily: "'Space Mono', monospace", boxShadow: `0 0 28px ${BRAND.primary}66` }}>YOU</div>
          </div>
          {GRAPH_POSITIONS.map((pos, i) => {
            const p = display[i]; if (!p) return null;
            const isSel = selected.includes(p.id), isHov = hoveredId === p.id;
            return (
              <div key={p.id}
                onClick={() => setSelected(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                onMouseEnter={() => setHoveredId(p.id)} onMouseLeave={() => setHoveredId(null)}
                style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)", cursor: "pointer", zIndex: 10,
                  filter: isSel ? `drop-shadow(0 0 8px ${p.color}99)` : "none",
                  transition: "all 0.2s",
                  animation: `cardEntrance 0.5s ${i * 0.1}s both`
                }}>
                <ProfileAvatar profile={p} size={38} selected={isSel} hovered={isHov} />
                {isHov && (
                  <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: BRAND.surface, border: `1px solid ${BRAND.borderHover}`, borderRadius: 8, padding: "8px 12px", whiteSpace: "nowrap", fontSize: 11, color: BRAND.text, fontFamily: "'Space Mono', monospace", pointerEvents: "none", zIndex: 20, boxShadow: `0 4px 20px ${BRAND.border}aa` }}>
                    {p.name}<div style={{ color: p.color, fontSize: 10 }}>{p.match}% match</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Profile list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {display.map((p, idx) => {
            const isSel = selected.includes(p.id);
            return (
              <div key={p.id} style={{ animation: `cardEntrance 0.45s ${idx * 0.07}s both` }}>
                <div onClick={() => setSelected(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                  style={{ background: isSel ? `${p.color}12` : BRAND.surface, border: `1px solid ${isSel ? p.color : BRAND.border}`, borderRadius: expanded === p.id ? "10px 10px 0 0" : 10, padding: "12px 14px", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <ProfileAvatar profile={p} size={30} selected={isSel} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: BRAND.text }}>{p.name}</span>
                        <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", color: p.color, fontWeight: 700 }}>{p.match}%</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: BRAND.muted, fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>{p.role}</div>
                  <MatchBar score={p.match} color={p.color} />
                  {p.match_reason && <div style={{ fontSize: 11, color: BRAND.primaryLight, fontFamily: "'Space Mono', monospace", marginTop: 4, fontStyle: "italic" }}>{p.match_reason}</div>}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
                    {(p.tags || []).map(t => (<span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: BRAND.subtle, color: BRAND.muted, fontFamily: "'Space Mono', monospace" }}>{t}</span>))}
                  </div>
                  {/* Research toggle */}
                  <button
                    onClick={e => { e.stopPropagation(); handleResearch(p); }}
                    style={{ marginTop: 8, padding: "4px 10px", background: "transparent", border: `1px solid ${BRAND.border}`, borderRadius: 6, color: BRAND.muted, fontSize: 11, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.target.style.borderColor = p.color; e.target.style.color = p.color; }}
                    onMouseLeave={e => { e.target.style.borderColor = BRAND.border; e.target.style.color = BRAND.muted; }}>
                    {researching[p.id] ? "Researching..." : expanded === p.id ? "▲ Hide research" : "🔍 Deep research"}
                  </button>
                </div>

                {/* Deep research panel */}
                {expanded === p.id && (
                  <div style={{ background: `${p.color}08`, border: `1px solid ${p.color}44`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "14px 16px" }}>
                    {researching[p.id] ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: BRAND.muted, fontFamily: "'Space Mono', monospace" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, animation: "nexusPulse 1s infinite" }} />
                        Running deep research with Tavily + Gemini...
                      </div>
                    ) : research[p.id] ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ fontSize: 12, color: BRAND.text, fontFamily: "'Space Mono', monospace", lineHeight: 1.6 }}>{research[p.id].background}</div>
                        {research[p.id].achievements?.length > 0 && (
                          <div>
                            <div style={{ fontSize: 10, color: p.color, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>Notable achievements</div>
                            {research[p.id].achievements.map((a, i) => (<div key={i} style={{ fontSize: 11, color: BRAND.muted, fontFamily: "'Space Mono', monospace", paddingLeft: 10, borderLeft: `2px solid ${p.color}44`, marginBottom: 3 }}>{a}</div>))}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: BRAND.primary, fontFamily: "'Space Mono', monospace", marginTop: 4, padding: "8px 10px", background: `${BRAND.primary}0a`, borderRadius: 6 }}>
                          💡 Why connect: {research[p.id].why_connect}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
          <NexusButton onClick={onNext} disabled={selected.length === 0} color={BRAND.primary} textColor="#fff" style={{ marginTop: 8 }}>
            Draft Messages for {selected.length} Profile{selected.length !== 1 ? "s" : ""} →
          </NexusButton>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 4: OUTREACH ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: BRAND.muted,    bg: BRAND.subtle    },
  sent:     { label: "Sent ✓",   color: BRAND.green,    bg: `${BRAND.green}12`  },
  skipped:  { label: "Skipped",  color: BRAND.gold,     bg: `${BRAND.gold}12`   },
  replied:  { label: "Replied!", color: BRAND.primary,  bg: `${BRAND.primary}12` },
};

function OutreachStep({ profiles, selected, userProfile }) {
  const [animIn, setAnimIn] = useState(false);
  // messages[id] = { friendly: "...", formal: "...", bold: "..." }
  const [messages, setMessages] = useState({});
  const [generating, setGenerating] = useState({});
  const [copied, setCopied] = useState({});
  const [error, setError] = useState({});
  // per-person selected tone
  const [tones, setTones] = useState({});
  // global tone selection (shown before generation starts)
  const [globalTone, setGlobalTone] = useState("friendly");
  const [toneChosen, setToneChosen] = useState(false);
  // outreach tracking
  const [status, setStatus] = useState({});

  const selectedProfiles = profiles.filter(p => selected.includes(p.id));

  const generateForProfile = async (p, tone) => {
    setGenerating(prev => ({ ...prev, [p.id]: { ...prev[p.id], [tone]: true } }));
    setError(prev => ({ ...prev, [p.id]: null }));
    try {
      const msg = await apiGenerateMessage(userProfile, p, tone);
      setMessages(prev => ({ ...prev, [p.id]: { ...prev[p.id], [tone]: msg } }));
    } catch (err) {
      setError(prev => ({ ...prev, [p.id]: err.message || "Failed to generate message" }));
    } finally {
      setGenerating(prev => ({ ...prev, [p.id]: { ...prev[p.id], [tone]: false } }));
    }
  };

  const startGeneration = () => {
    setToneChosen(true);
    const initialTones = {};
    selectedProfiles.forEach(p => { initialTones[p.id] = globalTone; });
    setTones(initialTones);
    selectedProfiles.forEach((p, i) => {
      setTimeout(() => generateForProfile(p, globalTone), i * 600);
    });
  };

  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);

  const handleToneSwitch = (p, tone) => {
    setTones(prev => ({ ...prev, [p.id]: tone }));
    if (!messages[p.id]?.[tone]) generateForProfile(p, tone);
  };

  const handleRegenerate = (p) => generateForProfile(p, tones[p.id] || globalTone);

  const handleExportAll = () => {
    const lines = selectedProfiles.map(p => {
      const tone = tones[p.id] || globalTone;
      const msg = messages[p.id]?.[tone] || "(not generated)";
      return `=== ${p.name} (${p.role}) ===\nTone: ${tone}\n\n${msg}\n`;
    });
    const blob = new Blob([lines.join("\n---\n\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "nexus_outreach.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const sentCount = Object.values(status).filter(s => s === "sent").length;
  const repliedCount = Object.values(status).filter(s => s === "replied").length;

  return (
    <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
      <StepChip number={4} label="Outreach" color={BRAND.accent} />
      <h2 className="shimmer-text" style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.1, margin: 0, marginBottom: 8, animation: "fadeSlideUp 0.6s 0.1s both" }}>Automated outreach</h2>
      <p style={{ color: BRAND.muted, fontSize: 14, marginBottom: 28 }}>Generate, track, and export personalized messages for all {selectedProfiles.length} people.</p>

      {/* ── Tone selector (shown before generation) ── */}
      {!toneChosen && (
        <div style={{ maxWidth: 560, marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 14 }}>Choose your outreach tone</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {TONE_OPTIONS.map(t => (
              <div key={t.id} onClick={() => setGlobalTone(t.id)}
                style={{ flex: 1, padding: "14px 16px", border: `2px solid ${globalTone === t.id ? t.color : BRAND.border}`, borderRadius: 12, cursor: "pointer", background: globalTone === t.id ? `${t.color}10` : BRAND.surface, transition: "all 0.2s" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: globalTone === t.id ? t.color : BRAND.text, marginBottom: 4 }}>{t.label}</div>
                <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: "'Space Mono', monospace" }}>{t.desc}</div>
              </div>
            ))}
          </div>
          <NexusButton onClick={startGeneration} color={BRAND.accent} textColor="#fff">
            Generate {selectedProfiles.length} Message{selectedProfiles.length !== 1 ? "s" : ""} →
          </NexusButton>
        </div>
      )}

      {/* ── Tracker bar ── */}
      {toneChosen && (
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: `${sentCount} sent`,    color: BRAND.green   },
              { label: `${repliedCount} replied`, color: BRAND.primary },
              { label: `${selectedProfiles.length - sentCount - repliedCount} pending`, color: BRAND.muted },
            ].map(({ label, color }) => (
              <div key={label} style={{ padding: "5px 12px", background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 20, fontSize: 11, color, fontFamily: "'Space Mono', monospace" }}>{label}</div>
            ))}
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={handleExportAll}
              style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${BRAND.border}`, borderRadius: 8, color: BRAND.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.borderColor = BRAND.primary; e.target.style.color = BRAND.primary; }}
              onMouseLeave={e => { e.target.style.borderColor = BRAND.border; e.target.style.color = BRAND.muted; }}>
              ↓ Export all as .txt
            </button>
          </div>
        </div>
      )}

      {/* ── Message cards ── */}
      {toneChosen && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
          {selectedProfiles.map((p, idx) => {
            const currentTone = tones[p.id] || globalTone;
            const currentMsg = messages[p.id]?.[currentTone];
            const isGenerating = generating[p.id]?.[currentTone];
            const currentStatus = status[p.id] || "pending";
            const statusCfg = STATUS_CONFIG[currentStatus];

            return (
              <div key={p.id} className="animate-card" style={{ background: BRAND.surface, border: `1px solid ${copied[p.id] ? BRAND.green : BRAND.border}`, borderRadius: 14, padding: 20, transition: "border-color 0.3s, transform 0.2s, box-shadow 0.2s", animationDelay: `${idx * 0.08}s` }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${BRAND.border}aa`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <ProfileAvatar profile={p} size={38} selected={true} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: BRAND.text }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: "'Space Mono', monospace" }}>{(p.platforms || []).join(" · ")}</div>
                  </div>
                  {/* Status badge */}
                  <div style={{ display: "flex", gap: 6 }}>
                    {["pending", "sent", "skipped", "replied"].map(s => (
                      <button key={s} onClick={() => setStatus(prev => ({ ...prev, [p.id]: s }))}
                        style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${currentStatus === s ? STATUS_CONFIG[s].color : BRAND.border}`, background: currentStatus === s ? STATUS_CONFIG[s].bg : "transparent", color: currentStatus === s ? STATUS_CONFIG[s].color : BRAND.muted, fontSize: 10, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}>
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone switcher */}
                <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                  {TONE_OPTIONS.map(t => (
                    <button key={t.id} onClick={() => handleToneSwitch(p, t.id)}
                      style={{ padding: "4px 12px", border: `1px solid ${currentTone === t.id ? t.color : BRAND.border}`, borderRadius: 20, background: currentTone === t.id ? `${t.color}14` : "transparent", color: currentTone === t.id ? t.color : BRAND.muted, fontSize: 11, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}>
                      {t.label} {messages[p.id]?.[t.id] ? "✓" : ""}
                    </button>
                  ))}
                </div>

                {error[p.id] && (
                  <div style={{ padding: "10px 14px", background: "#FFF0F0", border: `1px solid ${BRAND.red}44`, borderRadius: 8, fontSize: 12, color: BRAND.red, fontFamily: "'Space Mono', monospace", marginBottom: 12 }}>
                    ⚠ {error[p.id]}
                  </div>
                )}

                {isGenerating ? (
                  <div style={{ height: 72, display: "flex", alignItems: "center", gap: 10, color: BRAND.muted, fontFamily: "'Space Mono', monospace", fontSize: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.accent, animation: "nexusPulse 1s infinite" }} />
                    Drafting {currentTone} tone with Gemini...
                  </div>
                ) : currentMsg ? (
                  <>
                    <textarea value={currentMsg}
                      onChange={e => setMessages(prev => ({ ...prev, [p.id]: { ...prev[p.id], [currentTone]: e.target.value } }))}
                      rows={4}
                      style={{ width: "100%", background: BRAND.bg, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "12px 14px", color: BRAND.text, fontSize: 13, fontFamily: "'Space Mono', monospace", outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.7 }} />
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <NexusButton color={BRAND.accent} textColor="#fff" style={{ padding: "8px 18px", fontSize: 12 }}
                        onClick={() => { navigator.clipboard.writeText(currentMsg); setCopied(prev => ({ ...prev, [p.id]: true })); setTimeout(() => setCopied(prev => ({ ...prev, [p.id]: false })), 2000); }}>
                        {copied[p.id] ? "✓ Copied!" : "Copy Message"}
                      </NexusButton>
                      <button onClick={() => handleRegenerate(p)}
                        style={{ padding: "8px 18px", background: "transparent", border: `1px solid ${BRAND.border}`, borderRadius: 8, color: BRAND.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.target.style.borderColor = BRAND.gold; e.target.style.color = BRAND.gold; }}
                        onMouseLeave={e => { e.target.style.borderColor = BRAND.border; e.target.style.color = BRAND.muted; }}>
                        ↺ Regenerate
                      </button>
                      {p.profile_url ? (
                        <a href={p.profile_url} target="_blank" rel="noreferrer"
                          style={{ padding: "8px 18px", background: "transparent", border: `1px solid ${BRAND.border}`, borderRadius: 8, color: BRAND.muted, fontSize: 12, fontFamily: "'Space Mono', monospace", textDecoration: "none", transition: "all 0.2s", display: "inline-block" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.color = p.color; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.color = BRAND.muted; }}>
                          View Profile ↗
                        </a>
                      ) : (
                        <a href={`https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(p.name)}`} target="_blank" rel="noreferrer"
                          style={{ padding: "8px 18px", background: "transparent", border: `1px solid ${BRAND.border}`, borderRadius: 8, color: BRAND.muted, fontSize: 12, fontFamily: "'Space Mono', monospace", textDecoration: "none", transition: "all 0.2s", display: "inline-block" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.color = p.color; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.color = BRAND.muted; }}>
                          Find on LinkedIn ↗
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: BRAND.muted, fontFamily: "'Space Mono', monospace" }}>Waiting to generate...</div>
                )}
              </div>
            );
          })}

          {/* Summary footer */}
          <div style={{ padding: "14px 18px", background: `${BRAND.green}0d`, border: `1px solid ${BRAND.green}33`, borderRadius: 10, fontSize: 13, color: BRAND.green, fontFamily: "'Space Mono', monospace", lineHeight: 1.7 }}>
            ✦ Each message is drafted using Gemini with awareness of their actual research and background.
            Switch tones per person, mark status as you go, then export everything at once.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(-1);
  const [profileData, setProfileData] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const stepLabels = ["Profile", "Discover", "Graph", "Outreach"];
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const onMouseMove = useCallback(e => {
    setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${BRAND.bg}; color: ${BRAND.text}; }
        ::placeholder { color: ${BRAND.muted}; opacity: 1; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${BRAND.surface}; }
        ::-webkit-scrollbar-thumb { background: ${BRAND.borderHover}; border-radius: 2px; }

        /* ── Core keyframes ── */
        @keyframes nexusPulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.3;transform:scale(0.8);} }
        @keyframes nexusSpin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }

        /* Font / text animations */
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes glitchX {
          0%,90%,100% { clip-path: inset(0 0 100% 0); transform: translateX(0); }
          91% { clip-path: inset(10% 0 60% 0); transform: translateX(-4px); }
          93% { clip-path: inset(50% 0 20% 0); transform: translateX( 4px); }
          95% { clip-path: inset(30% 0 40% 0); transform: translateX(-2px); }
          97% { clip-path: inset(70% 0 10% 0); transform: translateX( 2px); }
        }
        @keyframes letterFloat {
          0%,100% { transform: translateY(0px);    }
          50%      { transform: translateY(-5px);   }
        }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0);    }
        }
        @keyframes fadeSlideLeft {
          from { opacity:0; transform:translateX(20px); }
          to   { opacity:1; transform:translateX(0);    }
        }
        @keyframes typewriterBlink {
          0%,100% { border-right-color: ${BRAND.pink}; }
          50%      { border-right-color: transparent;  }
        }
        @keyframes gradientShift {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes blobFloat {
          0%,100% { transform: translate(0,0) scale(1);       }
          33%      { transform: translate(24px,-18px) scale(1.06); }
          66%      { transform: translate(-16px,12px) scale(0.96); }
        }
        @keyframes blobFloat2 {
          0%,100% { transform: translate(0,0) scale(1);        }
          33%      { transform: translate(-20px,16px) scale(1.04); }
          66%      { transform: translate(18px,-22px) scale(0.97); }
        }
        @keyframes blobFloat3 {
          0%,100% { transform: translate(0,0) scale(1);        }
          50%      { transform: translate(12px,20px) scale(1.08); }
        }
        @keyframes nodeOrbit {
          from { transform: translate(-50%,-50%) rotate(0deg)   translateX(6px) rotate(0deg);   }
          to   { transform: translate(-50%,-50%) rotate(360deg) translateX(6px) rotate(-360deg); }
        }
        @keyframes logoSpin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes lineGrow {
          from { stroke-dashoffset: 100; }
          to   { stroke-dashoffset: 0;   }
        }
        @keyframes chipSlide {
          from { opacity:0; transform:translateX(-12px); }
          to   { opacity:1; transform:translateX(0);     }
        }
        @keyframes cardEntrance {
          from { opacity:0; transform:translateY(16px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes pulseRing {
          0%   { transform:scale(1);    opacity:0.6; }
          100% { transform:scale(1.8);  opacity:0;   }
        }

        /* Utility classes */
        .shimmer-text {
          background: linear-gradient(120deg, ${BRAND.primary} 0%, ${BRAND.pink} 30%, ${BRAND.gold} 60%, ${BRAND.primary} 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .animate-card { animation: cardEntrance 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .step-chip { animation: chipSlide 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .mag-btn {
          transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s !important;
        }
        .mag-btn:hover { transform: scale(1.04) translateY(-2px) !important; }
        .typewriter {
          border-right: 2px solid ${BRAND.pink};
          animation: typewriterBlink 0.9s step-end infinite;
          white-space: nowrap;
          overflow: hidden;
        }
      `}</style>
      <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }} onMouseMove={onMouseMove}>
        {/* ── Parallax background blobs ── */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", background: `radial-gradient(circle, ${BRAND.primary}18 0%, transparent 70%)`, top: `calc(10% + ${mouse.y * 30}px)`, left: `calc(5% + ${mouse.x * 20}px)`, animation: "blobFloat 9s ease-in-out infinite", transition: "top 0.4s ease, left 0.4s ease" }} />
          <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle, ${BRAND.accent}14 0%, transparent 70%)`, top: `calc(40% + ${mouse.y * -20}px)`, right: `calc(8% + ${mouse.x * -15}px)`, animation: "blobFloat2 11s ease-in-out infinite", transition: "top 0.5s ease, right 0.5s ease" }} />
          <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${BRAND.gold}10 0%, transparent 70%)`, bottom: `calc(15% + ${mouse.y * -25}px)`, left: `calc(35% + ${mouse.x * 10}px)`, animation: "blobFloat3 7s ease-in-out infinite", transition: "bottom 0.45s ease, left 0.45s ease" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${step >= 0 ? BRAND.border : "transparent"}`, backdropFilter: "blur(12px)", transition: "border-color 0.4s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setStep(-1)}
            onMouseEnter={e => { e.currentTarget.querySelector('svg').style.animation = 'logoSpin 1.2s linear infinite'; }}
            onMouseLeave={e => { e.currentTarget.querySelector('svg').style.animation = 'none'; }}>
            <NexusLogo size={28} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: BRAND.text, letterSpacing: -0.3 }}>Nexus</span>
          </div>
          {step >= 0 && (
            <div style={{ display: "flex", alignItems: "center" }}>
              {stepLabels.map((label, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: i === step ? BRAND.surface : "transparent", border: i === step ? `1px solid ${BRAND.border}` : "1px solid transparent", cursor: i < step ? "pointer" : "default", transition: "all 0.2s" }} onClick={() => { if (i < step) setStep(i); }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: i < step ? BRAND.primary : i === step ? BRAND.pink : BRAND.border, boxShadow: i === step ? `0 0 8px ${BRAND.pink}` : "none", transition: "all 0.3s" }} />
                    <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 1, textTransform: "uppercase", color: i === step ? BRAND.primary : i < step ? BRAND.green : BRAND.muted }}>{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && <div style={{ width: 16, height: 1, background: i < step ? BRAND.primary : BRAND.border, transition: "background 0.4s" }} />}
                </div>
              ))}
            </div>
          )}
        </header>
        <main style={{ flex: 1, padding: step === -1 ? "0 32px" : "48px 32px", maxWidth: step === -1 ? "100%" : 1020, width: "100%", margin: "0 auto", position: "relative" }}>
          {step === -1 && <HeroStep onStart={() => setStep(0)} />}
          {step === 0  && <ProfileStep data={profileData} setData={setProfileData} onNext={() => setStep(1)} setUserProfile={setUserProfile} />}
          {step === 1  && <SearchStep onNext={() => setStep(2)} setProfiles={setProfiles} userProfile={userProfile} />}
          {step === 2  && <GraphStep profiles={profiles} selected={selected} setSelected={setSelected} onNext={() => setStep(3)} />}
          {step === 3  && <OutreachStep profiles={profiles} selected={selected} userProfile={userProfile} />}
        </main>
        <footer style={{ padding: "16px 32px", borderTop: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: BRAND.muted, fontFamily: "'Space Mono', monospace" }}>Nexus © 2026</span>
          <span style={{ fontSize: 11, color: BRAND.muted, fontFamily: "'Space Mono', monospace" }}>
            {userProfile ? `✓ Profile: ${userProfile.name || "User"}` : "Powered by Gemini · Tavily · HuggingFace"}
          </span>
        </footer>
        </div>
      </div>
    </>
  );
}

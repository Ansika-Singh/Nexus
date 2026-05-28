import React, { useState, useEffect } from "react";
import { BRAND } from "../../utils/constants";
import { apiSearchPeople } from "../../utils/api";
import { StepChip } from "../shared/StepChip";
import { ErrorBanner } from "../shared/ErrorBanner";
import { NexusInput } from "../shared/NexusInput";
import { NexusButton } from "../shared/NexusButton";

// Build dynamic suggestions from the user's own profile
function buildSuggestions(profile) {
  const tags = profile?.tags || [];
  const role = profile?.role || "";

  // India-focused defaults grouped by domain
  const indianDefaults = [
    "IIT alumni working on AI startups in Bengaluru",
    "ML engineers at Indian product companies like Zepto, Meesho or Razorpay",
    "PhD students at IISc or TIFR working on deep learning",
    "Open source contributors in the Indian developer community",
    "SDE-2 engineers in Hyderabad or Pune switching to AI/ML roles",
    "Founders building B2B SaaS products in India",
    "Data scientists working in Indian fintech or healthtech",
    "Research engineers at TCS Research, Microsoft IDC or Google India",
  ];

  // Try to personalize using the user's own tags and role
  const personalized = [];
  if (tags.length > 0) {
    personalized.push(`${tags[0]} developers and researchers in India`);
  }
  if (tags.length > 1) {
    personalized.push(`People working on ${tags[0]} and ${tags[1]} at Indian startups`);
  }
  if (role && role.length > 3) {
    personalized.push(`${role}s at top Indian tech companies`);
  }

  // Blend personalized first, then fill with defaults up to 4 chips
  const combined = [...personalized, ...indianDefaults];
  return combined.slice(0, 4);
}

export function SearchStep({ onNext, setProfiles, userProfile }) {
  const [query, setQuery] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Any");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);
  const [animIn, setAnimIn] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);

  const EXPERIENCE_OPTIONS = ["Any", "Student / Entry Level (~18-24)", "Mid-Level Professional (~25-34)", "Senior / Executive (35+)"];
  const PHASES = ["Analyzing your semantic fingerprint...", "Searching LinkedIn, GitHub, Twitter...", "Computing similarity scores...", "Ranking your top matches..."];

  const handleSearch = async () => {
    if (!query.trim()) return;
    setError(null); setLoading(true); setPhase(0);
    let phaseIndex = 0;
    const cycle = setInterval(() => { phaseIndex++; if (phaseIndex < PHASES.length) setPhase(phaseIndex); else clearInterval(cycle); }, 900);
    try {
      const profiles = await apiSearchPeople(query, userProfile, experienceLevel);
      clearInterval(cycle); setPhase(PHASES.length - 1);
      setTimeout(() => { setProfiles(profiles.length > 0 ? profiles : []); onNext(); }, 500);
    } catch (err) { clearInterval(cycle); setLoading(false); setError(err.message || "Search failed. Check the backend is running."); }
  };

  const SUGGESTIONS = buildSuggestions(userProfile);

  return (
    <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
      <StepChip number={2} label="Discover" color={BRAND.gold} />
      <h2 className="shimmer-text" style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.1, margin: 0, marginBottom: 10, animation: "fadeSlideUp 0.6s 0.1s both" }}>Who are you looking for?</h2>
      <p style={{ color: BRAND.muted, fontSize: 15, marginBottom: 36, maxWidth: 480, animation: "fadeSlideUp 0.6s 0.2s both" }}>Describe in plain English. Nexus turns your words into a live multi-platform search via Tavily.</p>
      {!loading ? (
        <div style={{ maxWidth: 560 }}>
          <ErrorBanner message={error} onDismiss={() => setError(null)} />
          <NexusInput value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. ML engineers at Razorpay, Bengaluru, or PhD students at IIT Delhi interested in LLMs..." type="textarea" rows={3} />
          
          <div style={{ margin: "16px 0" }}>
            <div style={{ fontSize: 11, color: BRAND.muted, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 8 }}>Target Experience Level</div>
            <div style={{ position: "relative" }}>
              <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: `1px solid ${BRAND.border}`, color: BRAND.text, fontSize: 15, outline: "none", cursor: "pointer", appearance: "none", transition: "all 0.2s" }} onFocus={e => e.target.style.borderColor = BRAND.primary} onBlur={e => e.target.style.borderColor = BRAND.border}>
                {EXPERIENCE_OPTIONS.map(opt => (
                  <option key={opt} value={opt} style={{ background: "#0a0a0a", color: BRAND.text }}>{opt}</option>
                ))}
              </select>
              <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: BRAND.muted }}>▼</div>
            </div>
          </div>

          <div style={{ margin: "24px 0 24px" }}>
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

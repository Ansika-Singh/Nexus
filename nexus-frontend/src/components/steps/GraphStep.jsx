import React, { useState, useEffect } from "react";
import { BRAND, GRAPH_POSITIONS } from "../../utils/constants";
import { apiDeepResearch } from "../../utils/api";
import { ProfileAvatar } from "../shared/ProfileAvatar";
import { StepChip } from "../shared/StepChip";
import { MatchBar } from "../shared/MatchBar";
import { NexusButton } from "../shared/NexusButton";

export function GraphStep({ profiles, selected, setSelected, onNext }) {
  const [animIn, setAnimIn] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [expanded, setExpanded] = useState(null);
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
                  <div style={{ marginTop: 8, padding: "10px 12px", background: `${p.color}10`, borderRadius: 8, border: `1px solid ${p.color}33` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: p.color, fontFamily: "'Syne', sans-serif", marginBottom: 6 }}>🔥 {p.match}% Match Breakdown:</div>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: BRAND.text, fontFamily: "'Space Mono', monospace", lineHeight: 1.5, opacity: 0.85 }}>
                      <li style={{ paddingBottom: 4 }}>Strong alignment in <strong>{(p.tags && p.tags[0]) || "industry"}</strong> sector</li>
                      <li style={{ paddingBottom: 4 }}>Complementary expertise for a <strong>{p.role}</strong></li>
                      <li>{p.match_reason || "High potential for mutual value exchange and collaboration"}</li>
                    </ul>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 10 }}>
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

import React, { useState, useEffect } from "react";
import { BRAND, TONE_OPTIONS } from "../../utils/constants";
import { apiGenerateMessage } from "../../utils/api";
import { ProfileAvatar } from "../shared/ProfileAvatar";
import { StepChip } from "../shared/StepChip";
import { NexusButton } from "../shared/NexusButton";

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: BRAND.muted,    bg: BRAND.subtle    },
  sent:     { label: "Sent ✓",   color: BRAND.green,    bg: `${BRAND.green}12`  },
  skipped:  { label: "Skipped",  color: BRAND.gold,     bg: `${BRAND.gold}12`   },
  replied:  { label: "Replied!", color: BRAND.primary,  bg: `${BRAND.primary}12` },
};

export function OutreachStep({ profiles, selected, userProfile, saveToHistory, onNext }) {
  const [animIn, setAnimIn] = useState(false);
  const [messages, setMessages] = useState({});
  const [generating, setGenerating] = useState({});
  const [copied, setCopied] = useState({});
  const [saved, setSaved] = useState({});
  const [error, setError] = useState({});
  const [tones, setTones] = useState({});
  const [globalTone, setGlobalTone] = useState("friendly");
  const [toneChosen, setToneChosen] = useState(false);
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

  const handleExportCSV = () => {
    const header = "Name,Role,Platforms,Status,Message\n";
    const rows = selectedProfiles.map(p => {
      const tone = tones[p.id] || globalTone;
      const msg = (messages[p.id]?.[tone] || "").replace(/"/g, '""');
      const st = status[p.id] || "pending";
      return `"${p.name}","${p.role}","${(p.platforms||[]).join(", ")}","${st}","${msg}"`;
    });
    const blob = new Blob([header + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "nexus_outreach.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const sentCount = Object.values(status).filter(s => s === "sent").length;
  const repliedCount = Object.values(status).filter(s => s === "replied").length;

  return (
    <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
      <StepChip number={4} label="Outreach" color={BRAND.accent} />
      <h2 className="shimmer-text" style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.1, margin: 0, marginBottom: 8, animation: "fadeSlideUp 0.6s 0.1s both" }}>Automated outreach</h2>
      <p style={{ color: BRAND.muted, fontSize: 14, marginBottom: 28 }}>Generate, track, and export personalized messages for all {selectedProfiles.length} people.</p>

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
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <button onClick={handleExportAll}
              style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${BRAND.border}`, borderRadius: 8, color: BRAND.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.borderColor = BRAND.primary; e.target.style.color = BRAND.primary; }}
              onMouseLeave={e => { e.target.style.borderColor = BRAND.border; e.target.style.color = BRAND.muted; }}>
              ↓ .txt
            </button>
            <button onClick={handleExportCSV}
              style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${BRAND.border}`, borderRadius: 8, color: BRAND.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}
              onMouseEnter={e => { e.target.style.borderColor = BRAND.green; e.target.style.color = BRAND.green; }}
              onMouseLeave={e => { e.target.style.borderColor = BRAND.border; e.target.style.color = BRAND.muted; }}>
              ↓ .csv
            </button>
            <NexusButton onClick={onNext} color={BRAND.purple} textColor="#fff" style={{ padding: "8px 16px", fontSize: 12 }}>
              Go to Network History →
            </NexusButton>
          </div>
        </div>
      )}

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
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <ProfileAvatar profile={p} size={38} selected={true} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: BRAND.text }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: "'Space Mono', monospace" }}>{(p.platforms || []).join(" · ")}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["pending", "sent", "skipped", "replied"].map(s => (
                      <button key={s} onClick={() => setStatus(prev => ({ ...prev, [p.id]: s }))}
                        style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${currentStatus === s ? STATUS_CONFIG[s].color : BRAND.border}`, background: currentStatus === s ? STATUS_CONFIG[s].bg : "transparent", color: currentStatus === s ? STATUS_CONFIG[s].color : BRAND.muted, fontSize: 10, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}>
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>

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
                      <NexusButton color={BRAND.green} textColor="#fff" style={{ padding: "8px 18px", fontSize: 12 }}
                        onClick={() => { 
                          saveToHistory(p, currentMsg);
                          setSaved(prev => ({ ...prev, [p.id]: true })); 
                          setTimeout(() => setSaved(prev => ({ ...prev, [p.id]: false })), 2000);
                        }}>
                        {saved[p.id] ? "✓ Saved!" : "💾 Save to Network"}
                      </NexusButton>
                      
                      <NexusButton color="transparent" textColor={BRAND.text} style={{ padding: "8px 18px", fontSize: 12, border: `1px solid ${BRAND.border}` }}
                        onClick={() => { 
                          navigator.clipboard.writeText(currentMsg); 
                          setCopied(prev => ({ ...prev, [p.id]: true })); 
                          setTimeout(() => setCopied(prev => ({ ...prev, [p.id]: false })), 2000);
                        }}>
                        {copied[p.id] ? "✓ Copied!" : "📋 Copy"}
                      </NexusButton>
                      
                      {(() => {
                        const platColors = { LinkedIn: "#0A66C2", X: "#0f1419", Instagram: "#E1306C", Email: "#EA4335", GitHub: "#333333" };
                        
                        const exactPlatforms = (p.platform_urls && Object.keys(p.platform_urls).length > 0) ? Object.keys(p.platform_urls) : (p.platforms || []);
                        const basePlatforms = ["LinkedIn", "GitHub", "X"];
                        const allPlatforms = [...new Set([...exactPlatforms, ...basePlatforms])];
                        if (p.email && p.email !== "null") {
                          allPlatforms.push("Email");
                        }
                        
                        return allPlatforms.map(plat => {
                          const searchQuery = encodeURIComponent(`${p.name} ${p.role || ""}`);
                          
                          let url = "";
                          if (p.platform_urls && p.platform_urls[plat]) {
                            url = p.platform_urls[plat];
                          } else if (plat === "X") url = `https://x.com/search?q=${searchQuery}&f=user`;
                          else if (plat === "LinkedIn") url = `https://www.linkedin.com/search/results/all/?keywords=${searchQuery}`;
                          else if (plat === "GitHub") url = `https://github.com/search?q=${searchQuery}&type=users`;
                          else if (plat === "Instagram") url = `https://www.instagram.com/explore/tags/${encodeURIComponent((p.name || "").replace(/\s+/g, ""))}/`;
                          else if (plat === "Email") {
                            url = `mailto:${p.email}?subject=Networking&body=${encodeURIComponent(currentMsg)}`;
                          }
                          
                          const color = platColors[plat] || "#555555";
                          
                          return (
                            <NexusButton key={plat} color={color} textColor="#fff" style={{ padding: "8px 18px", fontSize: 12 }}
                              onClick={() => { 
                                navigator.clipboard.writeText(currentMsg); 
                                setCopied(prev => ({ ...prev, [p.id]: true })); 
                                setTimeout(() => setCopied(prev => ({ ...prev, [p.id]: false })), 2000);
                                window.open(url, "_blank");
                              }}>
                              {copied[p.id] ? "✓ Copied Message!" : `Open ${plat} ↗`}
                            </NexusButton>
                          );
                        });
                      })()}
                      <button onClick={() => handleRegenerate(p)}
                        style={{ padding: "8px 18px", background: "transparent", border: `1px solid ${BRAND.border}`, borderRadius: 8, color: BRAND.muted, fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.target.style.borderColor = BRAND.primary; e.target.style.color = BRAND.primary; }}
                        onMouseLeave={e => { e.target.style.borderColor = BRAND.border; e.target.style.color = BRAND.muted; }}>
                        ⟳ Regenerate
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

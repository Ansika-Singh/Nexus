import React, { useState, useEffect } from "react";
import { BRAND } from "../../utils/constants";
import { ProfileAvatar } from "../shared/ProfileAvatar";
import { StepChip } from "../shared/StepChip";
import confetti from "canvas-confetti";

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: BRAND.muted,    bg: BRAND.subtle    },
  sent:     { label: "Sent ✓",   color: BRAND.green,    bg: `${BRAND.green}12`  },
  seen:     { label: "Seen 👀",  color: BRAND.purple,   bg: `${BRAND.purple}12` },
  replied:  { label: "Replied!", color: BRAND.primary,  bg: `${BRAND.primary}12` },
};

export function HistoryStep({ history, updateHistoryStatus }) {
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);

  const handleStatusChange = (id, newStatus) => {
    updateHistoryStatus(id, newStatus);
    if (newStatus === "replied") {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [BRAND.primary, BRAND.accent, BRAND.green, BRAND.gold, BRAND.purple]
      });
    }
  };

  const repliedCount = history.filter(h => h.status === "replied").length;
  const sentCount = history.filter(h => h.status === "sent" || h.status === "seen").length;

  return (
    <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(24px)", transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)" }}>
      <StepChip number={5} label="Network History" color={BRAND.purple} />
      <h2 className="shimmer-text" style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 800, fontFamily: "'Syne', sans-serif", lineHeight: 1.1, margin: 0, marginBottom: 8, animation: "fadeSlideUp 0.6s 0.1s both" }}>Your CRM</h2>
      <p style={{ color: BRAND.muted, fontSize: 14, marginBottom: 28 }}>Track your networking progress, update statuses, and build your connections.</p>

      {history.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: `${history.length} Total Saved`, color: BRAND.muted },
              { label: `${sentCount} Reached Out`, color: BRAND.green },
              { label: `${repliedCount} Connections Made`, color: BRAND.primary },
            ].map(({ label, color }) => (
              <div key={label} style={{ padding: "5px 12px", background: BRAND.surface, border: `1px solid ${BRAND.border}`, borderRadius: 20, fontSize: 11, color, fontFamily: "'Space Mono', monospace" }}>{label}</div>
            ))}
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", background: BRAND.surface, border: `1px dashed ${BRAND.border}`, borderRadius: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🕸️</div>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18, color: BRAND.text, marginBottom: 8 }}>It's quiet in here...</h3>
          <p style={{ fontSize: 14, color: BRAND.muted, fontFamily: "'Space Mono', monospace" }}>Go discover some awesome people and add them to your history!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 680 }}>
          {history.map((item, idx) => {
            const p = item.profile;
            const currentStatus = item.status || "pending";
            
            return (
              <div key={item.id} className="animate-card" style={{ background: BRAND.surface, border: `1px solid ${currentStatus === "replied" ? BRAND.primary : BRAND.border}`, borderRadius: 14, padding: 20, transition: "border-color 0.3s, transform 0.2s, box-shadow 0.2s", animationDelay: `${idx * 0.08}s` }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 32px ${BRAND.border}aa`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <ProfileAvatar profile={p} size={38} selected={true} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: BRAND.text }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: "'Space Mono', monospace" }}>{p.role} · {(p.platforms || []).join(" · ")}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {["pending", "sent", "seen", "replied"].map(s => (
                      <button key={s} onClick={() => handleStatusChange(item.id, s)}
                        style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${currentStatus === s ? STATUS_CONFIG[s].color : BRAND.border}`, background: currentStatus === s ? STATUS_CONFIG[s].bg : "transparent", color: currentStatus === s ? STATUS_CONFIG[s].color : BRAND.muted, fontSize: 10, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}>
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: BRAND.bg, border: `1px solid ${BRAND.border}`, borderRadius: 8, padding: "12px 14px", color: BRAND.text, fontSize: 12, fontFamily: "'Space Mono', monospace", whiteSpace: "pre-wrap", maxHeight: 100, overflowY: "auto" }}>
                  {item.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

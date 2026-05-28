import React, { useState, useEffect, useRef } from "react";
import { BRAND } from "../../utils/constants";

// ── Avatar preview ──────────────────────────────────────────────────────────
function getAvatarUrl(name, gender, avatarStyle) {
  const seed = encodeURIComponent(name || "nexus");
  
  if (avatarStyle === "anime") {
    let sum = 0;
    for (let i = 0; i < (name || "nexus").length; i++) {
      sum += (name || "nexus").charCodeAt(i);
    }
    const idx = (sum % 5) + 1;
    return `/avatars/anime${idx}.png`;
  }
  const styleMap = {
    human:   gender === "female" ? "lorelei" : "micah",
    adventurer: "adventurer",
    "open-peeps": "open-peeps",
    animal:  "thumbs",
    pixel:   "pixel-art",
    anime:   "avataaars",
    bottts:  "bottts",
    shapes:  "shapes",
    initials: "initials",
  };
  const style = styleMap[avatarStyle] || "micah";
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b8d8ff`;
}

// ── Animated canvas background ───────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["#7c3aed", "#06b6d4", "#f472b6", "#34d399", "#fbbf24"];
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      });
      // draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124,58,237,${0.15 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
  );
}

// ── Field component ───────────────────────────────────────────────────────────
function Field({ label, icon, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontSize: 11, fontFamily: "'Space Mono',monospace", letterSpacing: 1,
        textTransform: "uppercase", color: BRAND.muted, display: "flex", alignItems: "center", gap: 6,
      }}>
        <span>{icon}</span>{label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px", background: "rgba(255, 255, 255, 0.7)",
  border: `1px solid ${BRAND.pinkLight}`, borderRadius: 8, color: "#000",
  fontSize: 14, fontFamily: "'Syne',sans-serif", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.2s",
};

// ── Main component ────────────────────────────────────────────────────────────
export default function LoginStep({ onComplete }) {
  const [form, setForm] = useState({
    name: "", gender: "male", role: "", organization: "", location: "",
    bio: "", avatarStyle: "human",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [animIn, setAnimIn] = useState(false);
  useEffect(() => { setTimeout(() => setAnimIn(true), 80); }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const avatarUrl = getAvatarUrl(form.name, form.gender, form.avatarStyle);

  const avatarStyles = [
    { value: "human",   label: "👤 Human"  },
    { value: "adventurer", label: "🤠 Adventurer" },
    { value: "open-peeps", label: "🕺 Peeps" },
    { value: "animal",  label: "🐺 Animal" },
    { value: "pixel",   label: "🎮 Pixel"  },
    { value: "anime",   label: "🎌 Anime"  },
    { value: "bottts",  label: "🤖 Robot"  },
    { value: "shapes",  label: "🔺 Shapes" },
    { value: "initials",label: "🔠 Initials" },
  ];

  const handleSubmit = () => {
    if (!form.name.trim()) { setError("Please enter your full name."); return; }
    setLoading(true);
    try {
      const profile = { ...form };
      localStorage.setItem("nexus_user_profile", JSON.stringify(profile));
      if (onComplete) onComplete(profile);
    } catch (e) {
      setError("Failed to save. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, background: BRAND.bg }}>
      <ParticleCanvas />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1, width: "100%", maxWidth: 880,
        margin: "0 20px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
        background: "rgba(255, 240, 246, 0.95)", backdropFilter: "blur(24px)",
        borderRadius: 20, border: `1px solid ${BRAND.pinkLight}`,
        boxShadow: `0 32px 80px rgba(255,107,157,0.15), 0 0 0 1px ${BRAND.pink}33`,
        overflow: "hidden",
        opacity: animIn ? 1 : 0,
        transform: animIn ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
        transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {/* ── Left panel: branding + avatar preview ── */}
        <div style={{
          padding: "48px 40px", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 24,
          background: `linear-gradient(135deg, ${BRAND.pink}1a 0%, ${BRAND.primary}0a 100%)`,
          borderRight: `1px solid ${BRAND.pinkLight}`,
        }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 900, fontSize: 36, margin: 0, background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.pink})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Nexus
            </h1>
            <p style={{ color: BRAND.muted, fontSize: 13, marginTop: 6, fontFamily: "'Space Mono',monospace" }}>
              Your AI networking agent
            </p>
          </div>

          {/* Avatar preview */}
          <div style={{ position: "relative" }}>
            <div style={{
              width: 140, height: 140, borderRadius: "50%",
              background: `linear-gradient(135deg, ${BRAND.primary}33, ${BRAND.pink}33)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 40px ${BRAND.primary}44`,
              border: `3px solid ${BRAND.primary}88`,
            }}>
              <img src={avatarUrl} alt="avatar" style={{ width: 120, height: 120, borderRadius: "50%" }} />
            </div>
            <div style={{
              position: "absolute", bottom: 4, right: 4,
              width: 28, height: 28, borderRadius: "50%",
              background: BRAND.green, border: `2px solid #0a0a14`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12,
            }}>✓</div>
          </div>

          <p style={{ color: BRAND.muted, fontSize: 12, textAlign: "center", maxWidth: 200, lineHeight: 1.6 }}>
            {form.name ? `Welcome, ${form.name}!` : "Fill your details to create your agent"}
          </p>

          {/* Avatar style picker */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {avatarStyles.map(s => (
              <button key={s.value} onClick={() => setForm(f => ({ ...f, avatarStyle: s.value }))}
                style={{
                  padding: "5px 10px", borderRadius: 20, fontSize: 11,
                  cursor: "pointer", fontFamily: "'Space Mono',monospace",
                  background: form.avatarStyle === s.value ? BRAND.pink : "rgba(255,255,255,0.5)",
                  color: form.avatarStyle === s.value ? "#fff" : BRAND.muted,
                  border: `1px solid ${form.avatarStyle === s.value ? BRAND.pink : BRAND.pinkLight}`,
                  transition: "all 0.2s",
                }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right panel: form ── */}
        <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", gap: 18, overflowY: "auto", maxHeight: "90vh" }}>
          <div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, margin: 0, color: "#000" }}>
              Create Your Profile
            </h2>
            <p style={{ color: BRAND.muted, fontSize: 13, marginTop: 4 }}>
              This is used to personalize your agent's outreach messages.
            </p>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", background: "#ef444422", border: "1px solid #ef4444", borderRadius: 8, color: "#ef4444", fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Row 1: Name + Gender */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Full Name" icon="👤">
              <input
                style={inputStyle}
                placeholder="Arjun Mehta"
                value={form.name}
                onChange={set("name")}
                onFocus={e => e.target.style.borderColor = BRAND.primary}
                onBlur={e => e.target.style.borderColor = BRAND.border}
              />
            </Field>
            <Field label="Gender" icon="⚧">
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.gender}
                onChange={set("gender")}
                onFocus={e => e.target.style.borderColor = BRAND.primary}
                onBlur={e => e.target.style.borderColor = BRAND.border}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Prefer not to say</option>
              </select>
            </Field>
          </div>

          {/* Row 2: Role + Org */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Professional Role" icon="💼">
              <input
                style={inputStyle}
                placeholder="ML Engineer"
                value={form.role}
                onChange={set("role")}
                onFocus={e => e.target.style.borderColor = BRAND.primary}
                onBlur={e => e.target.style.borderColor = BRAND.border}
              />
            </Field>
            <Field label="Organization" icon="🏢">
              <input
                style={inputStyle}
                placeholder="Acme AI"
                value={form.organization}
                onChange={set("organization")}
                onFocus={e => e.target.style.borderColor = BRAND.primary}
                onBlur={e => e.target.style.borderColor = BRAND.border}
              />
            </Field>
          </div>

          {/* Row 3: Location full-width */}
          <Field label="Location / City" icon="📍">
            <input
              style={inputStyle}
              placeholder="Bengaluru, India"
              value={form.location}
              onChange={set("location")}
              onFocus={e => e.target.style.borderColor = BRAND.primary}
              onBlur={e => e.target.style.borderColor = BRAND.border}
            />
          </Field>

          {/* Row 4: Short bio */}
          <Field label="Short Bio" icon="✍️">
            <textarea
              rows={3}
              style={{ ...inputStyle, resize: "none" }}
              placeholder="Studying at Cambridge Institute of Technology, passionate about connecting with like-minded people..."
              value={form.bio}
              onChange={set("bio")}
              onFocus={e => e.target.style.borderColor = BRAND.primary}
              onBlur={e => e.target.style.borderColor = BRAND.border}
            />
          </Field>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              marginTop: 4, padding: "14px 0", width: "100%",
              background: loading ? BRAND.border : `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})`,
              color: "#000", border: "none", borderRadius: 10,
              fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s", transform: "scale(1)",
              boxShadow: `0 8px 24px ${BRAND.primary}44`,
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          >
            {loading ? "Creating agent…" : "✨ Create My Agent"}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { BRAND } from "../../utils/constants";

// ── Animated particle canvas (neural net style) ──────────────────────────────
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const COLORS = ["#7c3aed","#06b6d4","#f472b6","#34d399","#fbbf24"];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.6 + 0.2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x, dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(124,58,237,${0.18*(1-dist/120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(words, speed = 90, pause = 1600) {
  const [display, setDisplay] = useState("");
  const [wIdx, setWIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setDisplay(word.slice(0, charIdx + 1));
        if (charIdx + 1 === word.length) setTimeout(() => setDeleting(true), pause);
        else setCharIdx(c => c + 1);
      } else {
        setDisplay(word.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) { setDeleting(false); setWIdx(i => (i + 1) % words.length); setCharIdx(0); }
        else setCharIdx(c => c - 1);
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wIdx, words, speed, pause]);
  return display;
}

// ── Counter animation ─────────────────────────────────────────────────────────
function AnimCounter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = Math.ceil(target / 60);
        const t = setInterval(() => {
          start = Math.min(start + step, target);
          setVal(start);
          if (start >= target) clearInterval(t);
        }, 24);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Section fade-in ───────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(36px)", transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s` }}>
      {children}
    </div>
  );
}

// ── Gradient text helper ──────────────────────────────────────────────────────
const GradText = ({ children, from = BRAND.primary, to = BRAND.pink }) => (
  <span style={{ background: `linear-gradient(135deg, ${from}, ${to})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
    {children}
  </span>
);

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          padding: "28px 24px", borderRadius: 16,
          background: hov ? `${color}08` : BRAND.surface,
          border: `1px solid ${hov ? color + "55" : BRAND.border}`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.03)`,
          transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)",
          transform: hov ? "translateY(-4px)" : "none",
          cursor: "default",
        }}>
        <div style={{ fontSize: 32, marginBottom: 14 }}>{icon}</div>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: BRAND.text, margin: "0 0 10px" }}>{title}</h3>
        <p style={{ color: BRAND.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{desc}</p>
      </div>
    </FadeIn>
  );
}

// ── Comparison table row ──────────────────────────────────────────────────────
function CompRow({ label, nexus, others }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "16px 0", borderBottom: `1px solid ${BRAND.border}66`, alignItems: "center" }}>
      <span style={{ color: BRAND.muted, fontSize: 14, fontWeight: 500 }}>{label}</span>
      <span style={{ color: BRAND.primary, fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}><span>✓</span>{nexus}</span>
      <span style={{ color: "#ef4444", fontSize: 14, display: "flex", alignItems: "center", gap: 6, opacity: 0.8 }}><span>✗</span>{others}</span>
    </div>
  );
}

// ── Main Hero export ──────────────────────────────────────────────────────────
export function HeroStep({ onStart }) {
  const typed = useTypewriter(["ML Engineers", "Startup Founders", "VC Investors", "Open Source Devs", "AI Researchers", "Product Designers", "College Students"]);
  const [heroIn, setHeroIn] = useState(false);
  useEffect(() => { setTimeout(() => setHeroIn(true), 120); }, []);

  return (
    <div style={{ color: BRAND.text, fontFamily: "'Syne',sans-serif", position: "relative", overflowX: "hidden" }}>
      <ParticleCanvas />

      {/* ═══════════════════════════════ HERO SECTION ════════════════════════ */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", textAlign: "center", position: "relative", zIndex: 1 }}>
        {/* Badge */}
        <div style={{
          opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s 0.1s",
          display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px",
          borderRadius: 20, background: `${BRAND.primary}22`, border: `1px solid ${BRAND.primary}55`,
          marginBottom: 32, fontSize: 12, fontFamily: "'Space Mono',monospace", color: BRAND.primary,
          letterSpacing: 1,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.green, display: "inline-block", animation: "pulseGreen 1.4s ease-in-out infinite" }} />
          AI-POWERED · LIVE IN SECONDS · FREE TO USE
        </div>

        {/* Headline */}
        <h1 style={{
          opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s 0.2s",
          fontSize: "clamp(36px, 6vw, 68px)", fontWeight: 900, lineHeight: 1.05,
          margin: "0 0 20px", letterSpacing: -1.5, maxWidth: 900,
        }}>
          Find &amp; Connect with <br />
          <GradText from={BRAND.primary} to={BRAND.pink}>{typed || "ML Engineers"}</GradText>
          <span style={{ color: BRAND.primary, animation: "blink 1s step-end infinite" }}>|</span>
        </h1>

        <p style={{
          opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s 0.35s",
          fontSize: "clamp(15px, 2vw, 20px)", color: BRAND.muted, maxWidth: 620,
          lineHeight: 1.75, marginBottom: 48,
        }}>
          Nexus uses <strong style={{ color: BRAND.primary }}>Gemini AI + Tavily</strong> to build your semantic profile, discover real matching professionals across the internet, and auto‑generate hyper‑personalized outreach — all in one click.
        </p>

        {/* CTAs */}
        <div style={{
          opacity: heroIn ? 1 : 0, transform: heroIn ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s 0.5s",
          display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 72,
        }}>
          <button
            onClick={onStart}
            style={{
              padding: "14px 36px", borderRadius: 12, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})`,
              color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15,
              boxShadow: `0 8px 24px ${BRAND.primary}44`,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = `0 12px 32px ${BRAND.primary}66`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = `0 8px 24px ${BRAND.primary}44`; }}>
            🚀 Get Started — Free
          </button>
          <a href="#features"
            style={{
              padding: "14px 28px", borderRadius: 12, cursor: "pointer",
              background: BRAND.surface, border: `1px solid ${BRAND.border}`,
              color: BRAND.text, fontFamily: "'Syne',sans-serif", fontWeight: 600, fontSize: 14,
              textDecoration: "none", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 8,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND.primary; e.currentTarget.style.color = BRAND.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.color = BRAND.text; }}>
            See how it works ↓
          </a>
        </div>

        {/* Stats row */}
        <div style={{
          opacity: heroIn ? 1 : 0, transition: "all 0.7s 0.65s",
          display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { label: "Profiles Discovered", value: 18000, suffix: "+" },
            { label: "Messages Generated", value: 4200, suffix: "+" },
            { label: "AI Models Used", value: 3, suffix: "" },
            { label: "Avg. Match Score", value: 94, suffix: "%" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: BRAND.primary, lineHeight: 1 }}>
                <AnimCounter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 11, color: BRAND.muted, fontFamily: "'Space Mono',monospace", marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", animation: "bounce 2s ease-in-out infinite", opacity: 0.5, fontSize: 20 }}>↓</div>
      </section>

      {/* ═══════════════════════════════ HOW IT WORKS ════════════════════════ */}
      <section id="features" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, color: BRAND.primary, fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 12 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 42px)", fontWeight: 900, margin: 0, letterSpacing: -1 }}>
              From zero to outreach in <GradText from={BRAND.accent} to={BRAND.primary}>4 steps</GradText>
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24 }}>
          {[
            { step: "01", icon: "👤", title: "Create Your Agent", desc: "Fill in your name, role, organization, gender and bio. Nexus creates a persistent AI agent with your professional identity.", color: BRAND.primary },
            { step: "02", icon: "🔍", title: "Describe Who You Need", desc: "Type a natural language query — 'ML engineers at AI startups in Bengaluru' — and Nexus searches the entire web for matches.", color: BRAND.accent },
            { step: "03", icon: "⬡", title: "Explore the Graph", desc: "Visualize matches as an interactive knowledge graph. See connections, scores, and clusters. Select the most relevant people.", color: BRAND.pink },
            { step: "04", icon: "✉️", title: "Send Personalized Outreach", desc: "Gemini writes a tailored message from your profile. Open their profile in one click with the message auto-copied — just hit paste and send.", color: BRAND.green },
          ].map((s, i) => (
            <FadeIn key={s.step} delay={i * 0.1}>
              <div style={{ padding: "32px 24px", borderRadius: 16, background: BRAND.surface, border: `1px solid ${BRAND.border}`, boxShadow: `0 4px 20px rgba(0,0,0,0.03)`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 16, right: 20, fontSize: 48, fontWeight: 900, color: s.color + "18", fontFamily: "'Syne',sans-serif" }}>{s.step}</div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: s.color, margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ color: BRAND.muted, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════ FEATURES ════════════════════════════ */}
      <section style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontSize: 12, color: BRAND.pink, fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 12 }}>FEATURES</div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 42px)", fontWeight: 900, margin: 0, letterSpacing: -1 }}>
              Everything you need, <GradText from={BRAND.pink} to={BRAND.accent}>nothing you don't</GradText>
            </h2>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          {[
            { icon: "🧠", title: "Semantic AI Matching", desc: "Powered by Gemini 2.5, Nexus understands context — not just keywords. It finds people by meaning, not just metadata.", color: BRAND.primary, delay: 0 },
            { icon: "🌐", title: "Real-time Web Search", desc: "Tavily's live web search crawls LinkedIn, GitHub, Twitter, personal sites and research papers for the freshest data.", color: BRAND.accent, delay: 0.1 },
            { icon: "⬡", title: "Interactive Knowledge Graph", desc: "See your professional universe as a living, animated graph. Hover, zoom, select and explore connections visually.", color: BRAND.pink, delay: 0.2 },
            { icon: "✍️", title: "Hyper-Personalized Messages", desc: "Every outreach message is written by Gemini using both your profile AND the target's profile — it reads like you wrote it.", color: BRAND.gold, delay: 0.3 },
            { icon: "⚡", title: "One-Click Send", desc: "Publish directly to LinkedIn or Twitter from Nexus. No copy-paste. No tab switching. Zero friction.", color: BRAND.green, delay: 0.4 },
            { icon: "🔐", title: "Fully Local & Private", desc: "All your profile data stays in your own browser's local storage. No accounts, no passwords, no data sold.", color: "#a78bfa", delay: 0.5 },
          ].map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ═══════════════════════════════ COMPARISON ══════════════════════════ */}
      <section style={{ padding: "80px 24px", maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, color: BRAND.gold, fontFamily: "'Space Mono',monospace", letterSpacing: 2, marginBottom: 12 }}>WHY NEXUS?</div>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 42px)", fontWeight: 900, margin: 0, letterSpacing: -1 }}>
              Old way vs <GradText from={BRAND.gold} to={BRAND.primary}>Nexus way</GradText>
            </h2>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div style={{ borderRadius: 16, border: `1px solid ${BRAND.border}`, overflow: "hidden", background: BRAND.surface, boxShadow: `0 8px 32px rgba(0,0,0,0.04)` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "16px 24px", background: `${BRAND.primary}11`, borderBottom: `1px solid ${BRAND.border}` }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: BRAND.muted, letterSpacing: 1, fontWeight: 600 }}>FEATURE</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: BRAND.primary, letterSpacing: 1, fontWeight: 700 }}>✦ NEXUS</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: BRAND.muted, letterSpacing: 1, fontWeight: 600 }}>OTHERS</span>
            </div>
            <div style={{ padding: "0 24px" }}>
              <CompRow label="Profile discovery" nexus="AI semantic search" others="Manual keyword search" />
              <CompRow label="Outreach messages" nexus="Auto-generated by Gemini" others="Copy-paste templates" />
              <CompRow label="Send messages" nexus="Direct to LinkedIn/Twitter" others="Manual copy-paste" />
              <CompRow label="Data privacy" nexus="100% local, no server" others="Cloud-stored, shared" />
              <CompRow label="Cost" nexus="Free to use" others="$50–$200/month" />
              <CompRow label="Setup time" nexus="Under 60 seconds" others="Hours of config" />
              <CompRow label="Match quality" nexus="Semantic + contextual" others="Title/keyword only" />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════════════════════════ CREATOR ════════════════════════════ */}
      <section style={{ padding: "80px 24px", maxWidth: 700, margin: "0 auto", position: "relative", zIndex: 1, textAlign: "center" }}>
        <FadeIn>
          <div style={{ padding: "40px 36px", borderRadius: 20, background: BRAND.surface, border: `1px solid ${BRAND.border}`, boxShadow: `0 8px 32px rgba(0,0,0,0.04)` }}>
            <img
              src="https://api.dicebear.com/7.x/lorelei/svg?seed=AnsikaSingh&backgroundColor=7c3aed"
              alt="Ansika Singh"
              style={{ width: 80, height: 80, borderRadius: "50%", border: `3px solid ${BRAND.primary}`, marginBottom: 20 }}
            />
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: BRAND.text, margin: "0 0 4px" }}>Built by Ansika Singh</h3>
            <p style={{ color: BRAND.primary, fontFamily: "'Space Mono',monospace", fontSize: 12, letterSpacing: 1, marginBottom: 20 }}>CAMBRIDGE INSTITUTE OF TECHNOLOGY · INDIA · 2026</p>
            <p style={{ color: BRAND.muted, fontSize: 14, lineHeight: 1.8, margin: "0 0 24px" }}>
              Nexus was born from a real frustration — spending hours manually searching LinkedIn, writing cold messages, and never getting replies. I built this to automate the entire process end-to-end using the latest AI models. It's the networking tool I always wished existed.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {["Gemini 2.5", "Tavily Search", "React 18", "Python Flask", "DiceBear Avatars"].map(t => (
                <span key={t} style={{ padding: "5px 14px", borderRadius: 20, background: `${BRAND.primary}18`, border: `1px solid ${BRAND.primary}44`, fontSize: 12, color: BRAND.primary, fontFamily: "'Space Mono',monospace" }}>{t}</span>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════════════════════════ CTA SECTION ═════════════════════════ */}
      <section style={{ padding: "100px 24px 120px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{
            maxWidth: 680, margin: "0 auto",
            padding: "64px 48px", borderRadius: 24,
            background: BRAND.surface,
            border: `1px solid ${BRAND.border}`,
            boxShadow: `0 12px 48px rgba(0,0,0,0.06)`,
          }}>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 42px)", fontWeight: 900, margin: "0 0 16px", letterSpacing: -1 }}>
              Ready to build your <br /><GradText>network on autopilot?</GradText>
            </h2>
            <p style={{ color: BRAND.muted, fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
              Join thousands of professionals who let Nexus do the networking work. No credit card. No account. Just your profile and a search query.
            </p>
            <button
              onClick={onStart}
              style={{
                padding: "16px 44px", borderRadius: 14, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})`,
                color: "#fff", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16,
                boxShadow: `0 8px 24px ${BRAND.primary}44`,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = `0 12px 32px ${BRAND.primary}66`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = `0 8px 24px ${BRAND.primary}44`; }}>
              🚀 Start Networking Free
            </button>
          </div>
        </FadeIn>
      </section>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(10px)} }
        @keyframes pulseGreen { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(52,211,153,0.4)} 50%{opacity:0.8;box-shadow:0 0 0 6px rgba(52,211,153,0)} }
      `}</style>
    </div>
  );
}

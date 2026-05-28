import React, { useState, useCallback, useEffect } from "react";
import { BRAND } from "./utils/constants";
import { NexusLogo } from "./components/shared/NexusLogo";
import { HeroStep } from "./components/steps/HeroStep";
import LoginStep from "./components/steps/LoginStep";
import { ProfileStep } from "./components/steps/ProfileStep";
import { SearchStep } from "./components/steps/SearchStep";
import { GraphStep } from "./components/steps/GraphStep";
import { OutreachStep } from "./components/steps/OutreachStep";
import { HistoryStep } from "./components/steps/HistoryStep";
import "./index.css";

// "screen" controls what full view is shown:
//   "home"     → Hero landing page
//   "login"    → Registration form
//   "app"      → Main app steps (step 1-4)
export default function App() {
  const [screen, setScreen] = useState("home"); // home → login → app
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [networkHistory, setNetworkHistory] = useState([]);
  const stepLabels = ["Links", "Discover", "Graph", "Outreach", "Network"];
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  // Hydrate saved profile and history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nexus_user_profile");
      if (stored) {
        setUserProfile(JSON.parse(stored));
        setScreen("app"); // skip home+login
        setStep(1);
      }
      const storedHistory = localStorage.getItem("nexus_history");
      if (storedHistory) {
        setNetworkHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  }, []);

  const onMouseMove = useCallback(e => {
    setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
  }, []);

  const logout = () => {
    localStorage.removeItem("nexus_user_profile");
    localStorage.removeItem("nexus_profile_data");
    // We intentionally don't clear nexus_history on logout, but could if desired
    setUserProfile(null);
    setProfileData({});
    setScreen("home");
    setStep(1);
  };

  const updateHistoryStatus = (id, newStatus) => {
    setNetworkHistory(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, status: newStatus } : item);
      localStorage.setItem("nexus_history", JSON.stringify(updated));
      return updated;
    });
  };

  const saveToHistory = (profile, message) => {
    setNetworkHistory(prev => {
      // Check if already exists, if so update message
      const exists = prev.find(item => item.id === profile.id);
      let updated;
      if (exists) {
        updated = prev.map(item => item.id === profile.id ? { ...item, message } : item);
      } else {
        updated = [...prev, { id: profile.id, profile, message, status: "pending", timestamp: Date.now() }];
      }
      localStorage.setItem("nexus_history", JSON.stringify(updated));
      return updated;
    });
  };

  // ── Full-screen login page (no navbar/footer chrome) ────────────────────
  if (screen === "login") {
    return (
      <LoginStep
        onComplete={(profile) => {
          setUserProfile(profile);
          setScreen("app");
          setStep(1);
        }}
      />
    );
  }

  // ── Home page (hero landing page) ──────────────────────────────────────
  if (screen === "home") {
    return (
      <div style={{ minHeight: "100vh", background: BRAND.bg, position: "relative" }}>
        {/* Sticky top navbar */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
          backdropFilter: "blur(24px)", background: "rgba(255, 192, 211, 0.85)",
          borderBottom: `1px solid ${BRAND.pink}44`,
          boxShadow: `0 4px 32px ${BRAND.primary}15`
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NexusLogo size={26} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: BRAND.text, letterSpacing: -0.5 }}>Nexus</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="#features" style={{ padding: "8px 18px", borderRadius: 8, color: BRAND.muted, fontSize: 14, textDecoration: "none", fontFamily: "'Syne',sans-serif", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = BRAND.text}
              onMouseLeave={e => e.currentTarget.style.color = BRAND.muted}>Features</a>
            <button onClick={() => setScreen("login")} style={{
              padding: "8px 22px", borderRadius: 8, border: "none", cursor: "pointer",
              background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})`,
              color: "#000", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14,
            }}>Get Started</button>
          </div>
        </nav>
        {/* Hero content (handles its own particle background) */}
        <HeroStep onStart={() => setScreen("login")} />
        {/* Footer */}
        <footer style={{ padding: "24px 40px", borderTop: `1px solid ${BRAND.border}22`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 1 }}>
          <span style={{ fontSize: 12, color: BRAND.muted, fontFamily: "'Space Mono',monospace" }}>Nexus © 2026 — Built in India 🇮🇳</span>
          <span style={{ fontSize: 12, color: BRAND.muted, fontFamily: "'Space Mono',monospace" }}>Powered by Gemini · Tavily · DiceBear</span>
        </footer>
      </div>
    );
  }

  // ── Main app ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }} onMouseMove={onMouseMove}>
      {/* Background blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", background: `radial-gradient(circle, ${BRAND.primary}18 0%, transparent 70%)`, top: `calc(10% + ${mouse.y * 30}px)`, left: `calc(5% + ${mouse.x * 20}px)`, animation: "blobFloat 9s ease-in-out infinite", transition: "top 0.4s ease, left 0.4s ease" }} />
        <div style={{ position: "absolute", width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle, ${BRAND.accent}14 0%, transparent 70%)`, top: `calc(40% + ${mouse.y * -20}px)`, right: `calc(8% + ${mouse.x * -15}px)`, animation: "blobFloat2 11s ease-in-out infinite", transition: "top 0.5s ease, right 0.5s ease" }} />
        <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: `radial-gradient(circle, ${BRAND.gold}10 0%, transparent 70%)`, bottom: `calc(15% + ${mouse.y * -25}px)`, left: `calc(35% + ${mouse.x * 10}px)`, animation: "blobFloat3 7s ease-in-out infinite", transition: "bottom 0.45s ease, left 0.45s ease" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Header */}
        <header style={{ padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BRAND.border}`, backdropFilter: "blur(12px)", transition: "border-color 0.4s" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={() => setScreen("home")}
            onMouseEnter={e => { e.currentTarget.querySelector("svg").style.animation = "logoSpin 1.2s linear infinite"; }}
            onMouseLeave={e => { e.currentTarget.querySelector("svg").style.animation = "none"; }}>
            <NexusLogo size={28} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, color: BRAND.text, letterSpacing: -0.3 }}>Nexus</span>
          </div>

          {/* Step nav */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {stepLabels.map((label, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: i + 1 === step ? BRAND.surface : "transparent", border: i + 1 === step ? `1px solid ${BRAND.border}` : "1px solid transparent", cursor: i + 1 < step ? "pointer" : "default", transition: "all 0.2s" }}
                  onClick={() => { if (i + 1 < step) setStep(i + 1); }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: i + 1 < step ? BRAND.primary : i + 1 === step ? BRAND.pink : BRAND.border, boxShadow: i + 1 === step ? `0 0 8px ${BRAND.pink}` : "none", transition: "all 0.3s" }} />
                  <span style={{ fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: 1, textTransform: "uppercase", color: i + 1 === step ? BRAND.primary : i + 1 < step ? BRAND.green : BRAND.muted }}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && <div style={{ width: 16, height: 1, background: i + 1 < step ? BRAND.primary : BRAND.border, transition: "background 0.4s" }} />}
              </div>
            ))}
          </div>

          {/* User avatar + logout */}
          {userProfile && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <img
                src={`https://api.dicebear.com/7.x/${userProfile.avatarStyle === "animal" ? "thumbs" : userProfile.avatarStyle === "pixel" ? "pixel-art" : userProfile.avatarStyle === "lorelei" ? "lorelei" : userProfile.avatarStyle === "bottts" ? "bottts" : userProfile.gender === "female" ? "avataaars" : "micah"}/svg?seed=${encodeURIComponent(userProfile.name)}`}
                alt="me"
                style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${BRAND.primary}` }}
              />
              <span style={{ fontSize: 13, fontFamily: "'Syne',sans-serif", color: BRAND.text }}>{userProfile.name}</span>
              <button onClick={logout} style={{ background: "transparent", border: `1px solid ${BRAND.border}`, color: BRAND.muted, cursor: "pointer", fontSize: 11, fontFamily: "'Space Mono',monospace", borderRadius: 6, padding: "4px 10px" }}>
                Logout
              </button>
            </div>
          )}
        </header>

        <main style={{ flex: 1, padding: "48px 32px", maxWidth: 1020, width: "100%", margin: "0 auto", position: "relative" }}>
          {step === 1 && <SearchStep onNext={() => setStep(2)} setProfiles={setProfiles} userProfile={userProfile} />}
          {step === 2 && <GraphStep profiles={profiles} selected={selected} setSelected={setSelected} onNext={() => setStep(3)} />}
          {step === 3 && <OutreachStep profiles={profiles} selected={selected} userProfile={userProfile} saveToHistory={saveToHistory} onNext={() => setStep(4)} />}
          {step === 4 && <HistoryStep history={networkHistory} updateHistoryStatus={updateHistoryStatus} />}
        </main>

        <footer style={{ padding: "16px 32px", borderTop: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, color: BRAND.muted, fontFamily: "'Space Mono', monospace" }}>Nexus © 2026</span>
          <span style={{ fontSize: 11, color: BRAND.muted, fontFamily: "'Space Mono', monospace" }}>Powered by Gemini · Tavily</span>
        </footer>
      </div>
    </div>
  );
}

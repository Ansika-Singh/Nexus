import React, { useState, useEffect } from "react";
import { BRAND } from "../../utils/constants";
import { apiBuildProfile } from "../../utils/api";
import { StepChip } from "../shared/StepChip";
import { ErrorBanner } from "../shared/ErrorBanner";
import { NexusInput } from "../shared/NexusInput";
import { NexusButton } from "../shared/NexusButton";

export function ProfileStep({ data, setData, onNext, setUserProfile }) {
  const [animIn, setAnimIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => { setTimeout(() => setAnimIn(true), 50); }, []);

  const handleNext = async () => {
    setError(null); setLoading(true);
    try { 
      const profile = await apiBuildProfile(data); 
      // Save permanently to local storage
      localStorage.setItem("nexus_user_profile", JSON.stringify(profile));
      localStorage.setItem("nexus_profile_data", JSON.stringify(data));
      
      setUserProfile(profile); 
      onNext(); 
    }
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
        <NexusInput label="Short Bio (optional)" value={data.bio || ""} onChange={e => setData({ ...data, bio: e.target.value })} placeholder="Final year at IIT Delhi, building AI agents, interested in LLMs and open source..." type="textarea" />
        <NexusButton onClick={handleNext} loading={loading} color={BRAND.green} textColor="#fff" style={{ alignSelf: "flex-start" }}>
          {loading ? "Creating agent..." : "Create my agent →"}
        </NexusButton>
      </div>
    </div>
  );
}

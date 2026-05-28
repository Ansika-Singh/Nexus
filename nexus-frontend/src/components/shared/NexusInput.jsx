import React, { useState } from "react";
import { BRAND } from "../../utils/constants";

export function NexusInput({ label, value, onChange, placeholder, type = "input", rows = 3 }) {
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

import React, { useState } from "react";
import { BRAND } from "../../utils/constants";

export function NexusButton({ children, onClick, disabled, loading, color, textColor, style = {} }) {
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

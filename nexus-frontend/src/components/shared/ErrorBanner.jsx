import React from "react";
import { BRAND } from "../../utils/constants";

export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{ padding: "12px 16px", background: "#FFF0F0", border: `1px solid ${BRAND.red}44`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: BRAND.red, fontFamily: "'Space Mono', monospace", marginBottom: 20 }}>
      <span>⚠ {message}</span>
      <button onClick={onDismiss} style={{ background: "none", border: "none", color: BRAND.red, cursor: "pointer", fontSize: 16 }}>×</button>
    </div>
  );
}

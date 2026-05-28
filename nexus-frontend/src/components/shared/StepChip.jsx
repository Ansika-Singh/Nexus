import React from "react";

export function StepChip({ number, label, color }) {
  return (
    <div style={{ marginBottom: 16 }} className="step-chip">
      <span style={{ fontSize: 10, letterSpacing: 4, color, fontFamily: "'Space Mono', monospace", textTransform: "uppercase", borderLeft: `2px solid ${color}`, paddingLeft: 8, paddingRight: 8, animation: `fadeSlideLeft 0.5s both` }}>
        {String(number).padStart(2, "0")} / {label}
      </span>
    </div>
  );
}

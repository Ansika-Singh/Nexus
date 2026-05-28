import React, { useState, useEffect } from "react";
import { BRAND } from "../../utils/constants";

export function MatchBar({ score, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(score), 120); return () => clearTimeout(t); }, [score]);
  return (
    <div style={{ marginTop: 6, height: 3, background: BRAND.subtle, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${width}%`, background: color, borderRadius: 2, transition: "width 1s cubic-bezier(0.16,1,0.3,1)" }} />
    </div>
  );
}

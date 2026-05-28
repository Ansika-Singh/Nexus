import React from "react";
import { BRAND } from "../../utils/constants";

export function NexusLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke={BRAND.primary} strokeWidth="1.5" />
      <circle cx="16" cy="8"  r="3"  fill={BRAND.primaryLight} />
      <circle cx="24" cy="21" r="3"  fill={BRAND.pink} />
      <circle cx="8"  cy="21" r="3"  fill={BRAND.gold} />
      <line x1="16" y1="8"  x2="24" y2="21" stroke={BRAND.primary} strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="16" y1="8"  x2="8"  y2="21" stroke={BRAND.primary} strokeWidth="1.2" strokeOpacity="0.6" />
      <line x1="24" y1="21" x2="8"  y2="21" stroke={BRAND.primary} strokeWidth="1.2" strokeOpacity="0.6" />
      <circle cx="16" cy="16" r="2.5" fill={BRAND.primary} opacity="0.5" />
    </svg>
  );
}

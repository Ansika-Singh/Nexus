import React from "react";
import { BRAND } from "../../utils/constants";

// Simple heuristic to guess gender based on first name (especially tuned for Indian names)
function guessGender(name) {
  if (!name) return "male";
  const firstName = name.split(" ")[0].toLowerCase();
  if (firstName.endsWith("a") || firstName.endsWith("i") || firstName.endsWith("ee") || firstName.endsWith("y")) {
    return "female";
  }
  return "male";
}

export function ProfileAvatar({ profile, size = 38, selected = false, hovered = false }) {
  const s = hovered ? size * 1.16 : size;
  const color = profile.color || BRAND.primary;
  
  const gender = profile.gender || guessGender(profile.name);
  
  // For females, we remove facial hair and guarantee hair.
  // For males, we add a high chance of facial hair to make them distinctly male.
  const isFemale = gender === "female";
  
  // We use the raw name as the seed, but append a unique number if needed to get a better hash.
  const seed = profile.name + (isFemale ? "" : "1"); 
  
  const avatarUrl = profile.image_url || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent&hairProbability=${isFemale ? 100 : 90}&facialHairProbability=${isFemale ? 0 : 50}`;

  return (
    <div 
      style={{ 
        width: s, 
        height: s, 
        borderRadius: "50%", 
        backgroundColor: `${color}33`, // Soft colored background
        border: selected ? `2px solid #fff` : `2px solid ${color}`,
        boxShadow: selected ? `0 0 0 2px ${color}, 0 4px 12px ${color}66` : `0 2px 8px ${color}33`,
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        overflow: "hidden",
        transition: "all 0.2s",
        flexShrink: 0,
        position: "relative"
      }}
    >
      {/* 3D Memoji style avatar */}
      <img 
        src={avatarUrl}
        style={{ 
          width: "90%", 
          height: "90%", 
          objectFit: "contain",
          transform: "translateY(5%) scale(1.1)", // Push slightly down to align faces nicely
          pointerEvents: "none"
        }}
        alt={profile.name || "User avatar"}
      />
    </div>
  );
}

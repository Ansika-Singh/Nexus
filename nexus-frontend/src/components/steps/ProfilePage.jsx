import React from "react";
import { BRAND } from "../../utils/constants";
import { NexusButton } from "../shared/NexusButton";

// Helper to build avatar URL based on type and name
function getAvatarUrl({ name, gender, avatarType }) {
  const seed = encodeURIComponent(name || "user");
  // Choose style
  const styleMap = {
    human: "micah",
    animal: "thumbs",
    random: "avataaars",
  };
  const style = styleMap[avatarType] || "micah";
  // Micah supports gender via hairProbability etc., we approximate by using style only
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
}

export default function ProfilePage({ profile }) {
  const avatarUrl = getAvatarUrl(profile);
  const message = `Hi, I'm ${profile.name}, a ${profile.role} at ${profile.organization}. I'm looking to connect with like‑minded professionals.`;

  // Simple share URLs – no auth needed
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(message)}`;

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <img
        src={avatarUrl}
        alt="avatar"
        style={{ width: 120, height: 120, borderRadius: "50%", border: `4px solid ${BRAND.primary}` }}
      />
      <h2 style={{ marginTop: 16, color: BRAND.text }}>{profile.name}</h2>
      <p style={{ color: BRAND.muted }}>{profile.role} @ {profile.organization}</p>
      <p style={{ color: BRAND.muted }}>{profile.location}</p>
      <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 12 }}>
        <NexusButton onClick={() => window.open(twitterUrl, "_blank")} color={BRAND.primary}>
          Tweet Message
        </NexusButton>
        <NexusButton onClick={() => window.open(linkedinUrl, "_blank")} color={BRAND.pink}>
          Share on LinkedIn
        </NexusButton>
      </div>
    </div>
  );
}

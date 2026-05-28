export const BRAND = {
  primary: "#2979FF", primaryLight: "#64A8FF", primaryGlow: "#2979FF28",
  accent: "#FF6B9D", accentGlow: "#FF6B9D28",
  pink: "#FF6B9D", pinkLight: "#FFB3CC", pinkGlow: "#FF6B9D20",
  green: "#00BFA5", gold: "#FF8C42", purple: "#845EF7", red: "#FF5370",
  bg: "#EDF5FF", surface: "#FFFFFF", surfaceHover: "#FFF0F6",
  border: "#B8D8FF", borderHover: "#FF9EC3",
  text: "#0A2540", muted: "#4F7099", subtle: "#DFF0FF",
};

export const GRAPH_POSITIONS = [
  { x: 75, y: 25 }, { x: 80, y: 65 }, { x: 50, y: 82 }, { x: 20, y: 65 }, { x: 22, y: 28 },
];

export const TONE_OPTIONS = [
  { id: "friendly",  label: "Friendly",  desc: "Warm, casual, approachable",       color: BRAND.green  },
  { id: "formal",    label: "Formal",    desc: "Professional, measured, concise",   color: BRAND.primary },
  { id: "bold",      label: "Bold",      desc: "Direct, confident, punchy",         color: BRAND.accent },
  { id: "wingman",   label: "Wingman",   desc: "Quirky 3rd-person intro",           color: BRAND.purple },
];

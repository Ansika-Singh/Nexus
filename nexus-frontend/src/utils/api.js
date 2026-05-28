export const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
// export const API_BASE = "https://YOUR_USERNAME-likemindswizard-backend.hf.space";

export async function apiBuildProfile(data) {
  const res = await fetch(`${API_BASE}/profile`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Profile build failed");
  return json.profile;
}

export async function apiSearchPeople(query, userProfile) {
  const res = await fetch(`${API_BASE}/search`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, user_profile: userProfile }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Search failed");
  return json.profiles;
}

export async function apiGenerateMessage(userProfile, targetProfile, tone = "friendly") {
  const res = await fetch(`${API_BASE}/message`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_profile: userProfile, target_profile: targetProfile, tone }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Message generation failed");
  return json.message;
}

export async function apiDeepResearch(profile) {
  const res = await fetch(`${API_BASE}/research`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profile }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Research failed");
  return json.research;
}

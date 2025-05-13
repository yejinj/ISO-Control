const API_BASE = "";

export async function fetchProbes() {
  const res = await fetch(`${API_BASE}/probes`);
  if (!res.ok) throw new Error("probes fetch 실패");
  return res.json();
}

export async function fetchHealthz() {
  const res = await fetch(`${API_BASE}/healthz`);
  if (!res.ok) throw new Error("healthz fetch 실패");
  return res.json();
}

export async function fetchReady() {
  const res = await fetch(`${API_BASE}/ready`);
  if (!res.ok) throw new Error("ready fetch 실패");
  return res.json();
}

export async function fetchStartup() {
  const res = await fetch(`${API_BASE}/startup`);
  if (!res.ok) throw new Error("startup fetch 실패");
  return res.json();
}

export async function fetchPods() {
  const res = await fetch(`${API_BASE}/pods`);
  if (!res.ok) throw new Error("pods fetch 실패");
  return res.json();
}

export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`);
  if (!res.ok) throw new Error("events fetch 실패");
  return res.json();
} 
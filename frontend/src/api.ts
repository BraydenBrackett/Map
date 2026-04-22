import type { Country, Relationship } from "./types";

const BASE = "http://localhost:8000";

export async function fetchCountries(): Promise<Country[]> {
  const res = await fetch(`${BASE}/countries/`);
  if (!res.ok) throw new Error(`Failed to fetch countries: ${res.status}`);
  return res.json();
}

export async function fetchRelationships(): Promise<Relationship[]> {
  const res = await fetch(`${BASE}/relationships/`);
  if (!res.ok) throw new Error(`Failed to fetch relationships: ${res.status}`);
  return res.json();
}

export interface Country {
  id: number;
  name: string;
  iso_code: string;
  lat: number;
  lon: number;
}

export interface Relationship {
  country_a: string;
  country_b: string;
  alignment_score: number;
}

export interface NetworkData {
  countries: Country[];
  relationships: Relationship[];
}

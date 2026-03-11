// ============================================================
// wwwine — Core TypeScript Types  (v2 — appellation-first)
// ============================================================

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface TastingProfile {
  body: 1 | 2 | 3 | 4 | 5;       // 1=very light  5=very full
  tannins: 1 | 2 | 3 | 4 | 5;    // 1=silky       5=grippy
  acidity: 1 | 2 | 3 | 4 | 5;    // 1=low         5=electric
  sweetness: 1 | 2 | 3 | 4 | 5;  // 1=bone dry    5=luscious
  alcohol: 1 | 2 | 3 | 4 | 5;    // 1=low         5=very high
  fruits: string[];
  secondaryNotes: string[];
  tertiaryNotes?: string[];
  finish: 'short' | 'medium' | 'long' | 'very long';
  style: string;
}

// ── Appellation is now the PRIMARY clickable map unit ──────────
export interface Appellation {
  id: string;                    // unique e.g. "sancerre"
  name: string;                  // "Sancerre"
  type: string;                  // "AOC" | "DOC" | "AVA" etc.
  coordinates: Coordinates;      // precise lat/lng for map pin
  grapes: string[];
  description: string;
  climate?: string;
  soilTypes?: string[];
  tastingProfile: TastingProfile;
  servingTemp: string;
  foodPairings: string[];
  agingPotential: string;
  bestVintages?: number[];
  wineries?: Winery[];
  color?: string;                // override region color if needed
}

export interface Deity {
  name: string;
  culture: string;
  role: string;
  note?: string;
}

export interface Winery {
  name: string;
  founded?: number;
  flagship?: string;
}

// ── Region groups appellations ─────────────────────────────────
export interface WineRegion {
  id: string;                    // e.g. "loire"
  region: string;                // "Loire Valley"
  country: string;               // "France"
  countryCode: string;           // "FR"
  continent: string;
  coordinates: Coordinates;      // region-level pin (shown when country selected)
  countryCoordinates: Coordinates;
  color: string;                 // hex UI accent
  vintage: string;               // "c. 1st century BCE"
  description: string;
  mythology: Deity[];
  appellations: Appellation[];   // ← each has its own coordinates
  productionVolume?: string;
}

// ── Country pin ────────────────────────────────────────────────
export interface WineCountry {
  code: string;
  name: string;
  coordinates: Coordinates;
  regionCount: number;
  color: string;
  continent: string;
}

// ── Map navigation state ───────────────────────────────────────
export type MapLevel = 'world' | 'country' | 'region';
export type AppView = 'map' | 'compare';

// ── Compare Engine — derived from appellations in regions.json ─
export interface CompareItem {
  id: string;               // "sancerre" or "pauillac"
  label: string;            // "Sancerre AOC"
  regionId: string;
  regionName: string;
  country: string;
  countryCode: string;
  grapes: string[];
  tastingProfile: TastingProfile;
  servingTemp: string;
  foodPairings: string[];
  agingPotential: string;
  color: string;
  type: string;             // AOC, DOC, AVA…
  description: string;
}

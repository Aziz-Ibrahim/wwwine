# 🍷 How to Add a New Appellation to wwwine

Everything lives in one file: `src/data/regions.json`

---

## Structure at a Glance

```
regions.json
 └── Region  (e.g. "Napa Valley")
      └── appellations[]  ← this is what shows on the map
           ├── id, name, type, coordinates
           ├── grapes, description
           ├── tastingProfile  (body/tannins/acidity/sweetness/alcohol + notes)
           ├── servingTemp, foodPairings, agingPotential
           ├── bestVintages
           └── wineries[]
```

---

## Example: Adding Santa Ynez Valley (inside Napa region or a new region)

### Step 1 — Find the right region object in `regions.json`
Look for `"id": "napa"` (or whichever region applies).

### Step 2 — Add a new entry to its `appellations` array:

```json
{
  "id": "santa-ynez",
  "name": "Santa Ynez Valley",
  "type": "AVA",
  "coordinates": { "lat": 34.60, "lng": -120.08 },
  "grapes": ["Syrah", "Grenache", "Pinot Noir", "Chardonnay"],
  "description": "...",
  "climate": "Cool maritime...",
  "soilTypes": ["Sandy loam", "Clay", "Shale"],
  "tastingProfile": {
    "body": 3,
    "tannins": 2,
    "acidity": 4,
    "sweetness": 1,
    "alcohol": 3,
    "fruits": ["Red cherry", "Strawberry", "Raspberry"],
    "secondaryNotes": ["Violet", "Herbs", "Earth"],
    "tertiaryNotes": ["Leather", "Spice"],
    "finish": "long",
    "style": "Cool-climate elegance from the Santa Ynez mountains"
  },
  "servingTemp": "14–16°C",
  "foodPairings": ["Salmon", "Duck", "Mushroom dishes"],
  "agingPotential": "5–15 years",
  "bestVintages": [2012, 2016, 2019, 2021],
  "wineries": [
    { "name": "Fess Parker Winery", "founded": 1989, "flagship": "Ashley's Pinot Noir" }
  ]
}
```

### Step 3 — Save the file. Done.

The pin appears automatically on the map when USA → Napa is selected. No code changes. No rebuilding. Just data.

---

## Adding a Completely New Country/Region

If the country doesn't exist yet, add a new top-level object to `regions.json`:

```json
{
  "id": "your-region-id",
  "region": "Your Region Name",
  "country": "Country Name",
  "countryCode": "XX",           ← ISO 3166-1 alpha-2
  "continent": "Europe",         ← or Americas/Africa/Asia/Oceania
  "coordinates": { "lat": 0.0, "lng": 0.0 },         ← region pin
  "countryCoordinates": { "lat": 0.0, "lng": 0.0 },  ← country pin on world map
  "color": "#722F37",            ← hex color for UI accent
  "vintage": "c. 1st century BCE",
  "description": "...",
  "mythology": [],
  "productionVolume": "~X million bottles/year",
  "appellations": [ ... ]
}
```

Also add a zoom config for the new country in `WorldMap.tsx`:
```typescript
const COUNTRY_ZOOM = {
  // ... existing
  XX: { zoom: 6, center: [lng, lat] },
}
```

And a region zoom config:
```typescript
const REGION_ZOOM = {
  // ... existing
  'your-region-id': { zoom: 8, center: [lng, lat] },
}
```

---

## Tasting Profile Scale

| Value | Body      | Tannins | Acidity  | Sweetness | Alcohol    |
|-------|-----------|---------|----------|-----------|------------|
| 1     | Very Light| Silky   | Low      | Bone Dry  | Low <11%   |
| 2     | Light     | Soft    | Soft     | Dry       | Moderate   |
| 3     | Medium    | Medium  | Medium   | Off-Dry   | Medium     |
| 4     | Full      | Firm    | Crisp    | Sweet     | High       |
| 5     | Very Full | Grippy  | Electric | Luscious  | Very High  |

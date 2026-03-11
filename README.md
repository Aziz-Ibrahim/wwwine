# 🍷 wwwine — World Wide Wine Atlas

> *An open atlas of the world's great wine regions: appellations, ancient mythology, notable houses, and a comparison engine.*

**Live:** Deploy free to [Vercel](https://vercel.com) · **Stack:** Next.js 14 · TypeScript · JSON · CSS Modules · react-simple-maps

---

## Features

| Feature | Description |
|---|---|
| 🗺️ **Interactive World Map** | Click pins on a real geo-projected world map to explore wine regions |
| 📜 **Region Detail Panel** | Appellations, ancient deity patrons, notable wineries, grapes, vintages |
| ⚖️ **Comparison Engine** | Compare any two wines side-by-side with tasting notes, scores, food pairings |
| 🏺 **Mythology** | Each region's ancient patron deities with historical context |
| 🔌 **REST API** | `/api/regions`, `/api/regions/[id]`, `/api/compare-wines` |

---

## Quick Start

```bash
# 1. Clone / download the project
git clone https://github.com/your-username/wwwine.git
cd wwwine

# 2. Install dependencies (no paid packages)
npm install

# 3. Run locally
npm run dev
# → http://localhost:3000
```

---

## Deploy to Vercel (Free)

```bash
# Option A — Vercel CLI
npm install -g vercel
vercel

# Option B — GitHub
# Push to GitHub → Import repo at vercel.com/new → Deploy
```

No environment variables required. The project is fully static-data-driven.

---

## Project Structure

```
wwwine/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, fonts, metadata
│   │   ├── page.tsx            # Home page (server component)
│   │   ├── globals.css         # Global styles, CSS variables
│   │   └── api/
│   │       ├── regions/
│   │       │   ├── route.ts    # GET /api/regions?q=bordeaux
│   │       │   └── [id]/route.ts  # GET /api/regions/bordeaux
│   │       └── compare-wines/
│   │           └── route.ts    # GET /api/compare-wines
│   ├── components/
│   │   ├── AtlasClient.tsx     # Main client shell (map + compare nav)
│   │   ├── Header.tsx          # Top nav
│   │   ├── WorldMap.tsx        # react-simple-maps interactive map
│   │   ├── RegionPanel.tsx     # Side panel with full region detail
│   │   └── CompareEngine.tsx   # Side-by-side wine comparison
│   ├── data/
│   │   ├── regions.json        # All wine region data (10 regions to start)
│   │   └── compare-wines.json  # Wines available in the comparison engine
│   ├── lib/
│   │   └── data.ts             # Data access helpers, search, sommelier note
│   └── types/
│       └── index.ts            # All TypeScript types
├── public/                     # Static assets
├── next.config.js
├── tsconfig.json
├── vercel.json
└── package.json
```

---

## Data Schema

### Wine Region (`src/data/regions.json`)

```json
{
  "id": "bordeaux",
  "region": "Bordeaux",
  "country": "France",
  "continent": "Europe",
  "coordinates": { "lat": 44.8378, "lng": -0.5792 },
  "mythology": [
    {
      "name": "Bacchus",
      "culture": "Roman",
      "role": "God of Wine, Festivity & Ritual Madness",
      "note": "Historical context about the deity and this region..."
    }
  ],
  "appellations": [
    {
      "name": "Médoc",
      "type": "AOC",
      "grapes": ["Cabernet Sauvignon", "Merlot"],
      "description": "The great châteaux of the left bank."
    }
  ],
  "wineries": [
    {
      "name": "Château Margaux",
      "founded": 1590,
      "flagship": "Château Margaux Premier Grand Cru Classé"
    }
  ],
  "grapes": ["Cabernet Sauvignon", "Merlot"],
  "description": "Long-form description of the region...",
  "climate": "Maritime — mild, wet winters...",
  "soilTypes": ["Gravel", "Clay", "Limestone"],
  "color": "#722F37",
  "vintage": "c. 1st century BCE",
  "bestVintages": [2000, 2005, 2009, 2010],
  "productionVolume": "~700 million bottles/year"
}
```

### Compare Wine (`src/data/compare-wines.json`)

```json
{
  "id": "arg-malbec",
  "label": "Argentine Malbec",
  "regionId": "mendoza",
  "region": "Mendoza",
  "country": "Argentina",
  "grapes": ["Malbec"],
  "style": "Full-bodied, velvety, dark fruit",
  "tastingNotes": ["Blackberry", "Plum", "Dark chocolate"],
  "aging": "12–18 months French oak",
  "alcohol": "13.5–15%",
  "priceRange": "$$",
  "criticScore": 92,
  "servingTemp": "16–18°C",
  "foodPairings": ["Asado", "Empanadas"],
  "color": "#6B2D8B",
  "agingPotential": "5–15 years"
}
```

---

## Adding Wine Regions

1. Open `src/data/regions.json`
2. Add a new object following the schema above
3. Use real `lat`/`lng` coordinates for accurate map placement
4. The pin appears immediately on the map — no code changes needed

---

## REST API

| Endpoint | Description |
|---|---|
| `GET /api/regions` | All regions |
| `GET /api/regions?q=bordeaux` | Search by name, country, grape, appellation |
| `GET /api/regions?continent=Europe` | Filter by continent |
| `GET /api/regions/bordeaux` | Single region by ID |
| `GET /api/compare-wines` | All comparison wines |

---

## Roadmap Ideas

- [ ] Region pages at `/region/[id]` with full-page detail
- [ ] User-contributed region submissions (via GitHub PR or form)
- [ ] Vintage chart overlays on the map
- [ ] Wine search across grapes, appellations, countries
- [ ] Colour-coded map by wine style (red / white / sparkling / fortified)
- [ ] Offline PWA support
- [ ] i18n (French, Spanish, Italian, German, Portuguese)

---

## Philosophy

wwwine is free to use, free to build, and free to host.  
The data is JSON. The stack is standard. The knowledge belongs to everyone.

*In vino veritas.*

---

## License

MIT — fork it, extend it, make it yours.

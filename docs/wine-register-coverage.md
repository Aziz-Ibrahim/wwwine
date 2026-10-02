# Wine-region catalogue coverage

Target: every official wine region worldwide. **The target is not yet complete.**

The 2 October 2026 import contains 2,762 official designations across 40 countries.
Together with unmatched existing wine guides, the browse page has 2,829 entries.
These are designations, not 2,762 mutually exclusive areas: regions, subregions,
zones, and different protected wine categories can overlap.

## Imported sources

Exact URLs, download dates, SHA-256 snapshot hashes and scopes are embedded in
`src/data/wine-register.json` and surfaced on the browse/detail pages.

| Source | Imported entries | Scope |
| --- | ---: | --- |
| European Commission eAmbrosia | 1,648 | Registered wine PDOs/PGIs; pending and removed records excluded. Domestic equivalents replace Napa Valley and Vale dos Vinhedos PDO. |
| Wine Australia | 114 | All names in the Australian GI table, including broader areas, zones and subregions. |
| US TTB | 280 | All established AVAs in the downloaded table. |
| IPONZ | 22 | Registered domestic wine GIs and enduring indications. |
| Georgia Sakpatenti | 33 | Wine appellations in the mixed-goods state register. |
| Chile SAG | 119 | Article 1 regions, subregions, zones and areas; Secano Interior. |
| Argentina INV | 121 | Published IG/DOC list; province and designation distinguish homonyms. |
| South Africa SAWIS | 150 | February 2026 Wine of Origin production areas at all listed levels. |
| Japan NTA | 5 | Domestic wine GIs only. |
| British Columbia regulation | 22 | Section 56 GIs, including provincial and regional subdivisions. |
| Ontario Wine Appellation Authority | 18 | Provincial, regional, appellation and subappellation names, including West Niagara. |
| Québec CARTV | 2 | Vin du Québec and Vin de glace du Québec. |
| Switzerland FOAG | 63 | January 2026 AOC/KUB/DOC list; intercantonal names counted once. |
| Brazil INPI | 13 | 10 wine IPs and 3 DOs; domestic wine products only. |
| UK Defra | 138 additional | Registered names from UK, Albania, Serbia, Moldova, Ukraine and Liechtenstein not already matched in eAmbrosia. All 43 result pages checked. |
| Montenegro / EU Council | 13 | Names confirmed as already nationally protected in the December 2025 accession document, page 18. Does not imply completed EU registration. |
| India GI Registry | 1 | Registered Nashik Valley Wine GI 123. |

Foreign entries in eAmbrosia or the UK register prove protection in those
jurisdictions; they do not establish complete coverage of the country of origin.
Snapshot checks fail when expected table counts change so a maintainer reviews
new registrations, changed layouts and reclassifications before publishing.

## Outstanding worldwide audit

- Reconcile domestic registers for Albania, Serbia, Moldova, Ukraine and
  Liechtenstein with their UK/EU registrations.
- Audit North Macedonia, Bosnia and Herzegovina, Kosovo, Armenia, Azerbaijan,
  Russia, China, Turkey, Israel, Lebanon, Palestine, Mexico, Uruguay, Peru,
  Bolivia, Morocco, Algeria, Tunisia, India beyond Nashik, and other wine-producing
  countries. Existing guides or isolated foreign registrations are not evidence
  that these countries are complete.
- Audit Canada beyond the imported BC, Ontario and Québec sources, including
  federal CIPO registrations and Nova Scotia's wine appellation scheme.
- Add US state/county appellations separately from AVAs; audit Swiss land wines
  and supplementary local names separately from the federal AOC list.
- Audit legally recognised subdivisions inside European PDOs, such as named
  subzones, village designations and vineyard classifications. eAmbrosia is a
  PDO/PGI register, not an exhaustive list of every permitted place name.
- Review Chile's supplementary labels and permitted Secano Interior combinations.
- Distinguish legally protected names from regional groupings used by official
  wine promotion bodies. Do not label an educational region as a registered GI.

## Maps and tasting guides

All 65 Australian wine regions have representative map points derived from Wine
Australia's official ArcGIS polygons: 64 regional features plus Gippsland's zone
feature. The point is the bounding-box centre of the largest polygon, suitable
for overview navigation, not a legal boundary or a vineyard location. Each point
retains its source layer. Australian subregions and other countries' new records
remain searchable and browsable without speculative coordinates.

The original 122 tasting guides remain intact. New registration records do not
invent tasting scores, mythology, producers or vintages. Exact name/country
matches and three explicit Australian mappings link to existing guides. Short
sourced regional introductions cover Yarra Valley, Coonawarra, Clare Valley and
Margaret River. More detailed editorial guides remain separate work.

## Refresh and validate

Use a directory outside the repository for downloaded source snapshots. In
PowerShell, for example:

```powershell
$snapshotDirectory = Join-Path $env:TEMP 'wwwine-register-snapshots'
node scripts/download-wine-registers.mjs $snapshotDirectory
node scripts/download-uk-wine-register.mjs $snapshotDirectory
uv run --with pdfplumber scripts/extract-wine-register-pdfs.py $snapshotDirectory
node scripts/import-wine-registers.cjs $snapshotDirectory
npm.cmd run data:validate
npm.cmd run type-check
npm.cmd run build
```

Update dated PDF URLs in `scripts/wine-register-sources.json` and the importer
when the authorities publish replacements. Inspect rendered PDF pages before
changing extraction rules; merged cells, bilingual aliases, continuation pages
and wine-to-spirit distinctions need review. The importer uses downloaded file
mtime for the checked date and hashes the original source bytes, not generated
extractions. Preserve the snapshot directory with a release for reproducibility.

The data validator exercises the real application search/link functions and
checks counts, stable unique IDs, source URLs, finite sourced coordinates,
excluded products, alternative spellings, homonyms and key regression records.

"""Extract source tables for review; run with uv run --with pdfplumber."""
import json
import sys
from pathlib import Path
import pdfplumber
import pypdfium2 as pdfium

folder = Path(sys.argv[1])
for code in (sys.argv[2:] or ["ar", "za", "ch", "br-ip", "br-do", "me"]):
    with pdfplumber.open(folder / f"wwwine-{code}.pdf") as pdf:
        pages = [{"text": page.extract_text(), "tables": page.extract_tables()} for page in pdf.pages]
    (folder / f"wwwine-{code}-tables.json").write_text(json.dumps(pages, ensure_ascii=False, indent=2), encoding="utf-8")
    print(code, "pages:", len(pages), "tables:", sum(len(p["tables"]) for p in pages))
    document = pdfium.PdfDocument(folder / f"wwwine-{code}.pdf")
    for index in range(len(document)):
        if code == "me" and index != 17:
            continue  # Wine names occupy page 18 of this accession document.
        document[index].render(scale=1.2).to_pil().save(folder / f"wwwine-{code}-{index + 1}.png")

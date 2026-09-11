#!/usr/bin/env python3
"""
fetch_publications.py
─────────────────────
Scrapes Lan Zhang's Google Scholar profile and writes
data/publications.json for the lab website.

Usage:
    pip install scholarly
    python scripts/fetch_publications.py --scholar-id YOUR_ID

Schedule (macOS launchd / cron) to run every 6 months.
"""

import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List

# ── Google Scholar ID ─────────────────────────────────────────────────────
# Find it in your Scholar URL: scholar.google.com/citations?user=XXXX
DEFAULT_SCHOLAR_ID = "dgDl4uAAAAAJ"

# ── Type heuristics (venue name → type) ──────────────────────────────────
CONFERENCE_KEYWORDS = [
    "proceedings", "proc.", "conf.", "symposium", "workshop", "workshop on",
    "acm", "ieee", "usenix", "ndss", "ccs", "sp ", "s&p", "www ", "icse",
    "sigcomm", "infocom", "mobicom", "sensys", "ipsn", "iccv", "cvpr", "nips",
    "neurips", "icml", "iclr", "aaai", "ijcai",
]

JOURNAL_KEYWORDS = [
    "journal", "transactions", "letters", "magazine", "review",
    "toc", "ton", "tomc", "tois", "tdsc", "tifs",
]

PREPRINT_KEYWORDS = ["arxiv", "preprint", "biorxiv", "ssrn"]


def classify(venue: str) -> str:
    v = venue.lower()
    if any(k in v for k in PREPRINT_KEYWORDS):
        return "preprint"
    if any(k in v for k in JOURNAL_KEYWORDS):
        return "journal"
    if any(k in v for k in CONFERENCE_KEYWORDS):
        return "conference"
    return "conference"   # default


def fetch_with_scholarly(scholar_id: str) -> List[Dict]:
    try:
        from scholarly import scholarly as sch
    except ImportError:
        raise SystemExit(
            "scholarly not installed. Run: pip install scholarly"
        )

    print(f"Fetching profile for Scholar ID: {scholar_id} …")
    author = sch.search_author_id(scholar_id)
    sch.fill(author, sections=["publications"])

    pubs = []
    total = len(author.get("publications", []))
    for i, pub_stub in enumerate(author["publications"], 1):
        print(f"  [{i}/{total}] fetching details…", end="\r", flush=True)
        try:
            pub = sch.fill(pub_stub)
            bib = pub.get("bib", {})
            title   = bib.get("title",   "")
            authors = bib.get("author",  "")
            venue   = bib.get("venue",   "") or bib.get("journal", "")
            year    = bib.get("pub_year", "") or bib.get("year", "")
            url     = pub.get("pub_url",  "") or ""

            if not title:
                continue

            pubs.append({
                "year":    int(year) if str(year).isdigit() else 0,
                "title":   title,
                "authors": authors,
                "venue":   venue,
                "url":     url,
                "type":    classify(venue),
            })
        except Exception as e:
            print(f"\n  Warning: could not fetch pub detail ({e})")

    print(f"\nFetched {len(pubs)} publications.")
    return pubs


def main():
    parser = argparse.ArgumentParser(description="Fetch Google Scholar publications.")
    parser.add_argument("--scholar-id", default=DEFAULT_SCHOLAR_ID, help="Google Scholar user ID")
    args = parser.parse_args()

    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    pubs = fetch_with_scholarly(args.scholar_id)
    pubs.sort(key=lambda p: (-p["year"], p["title"]))

    js_path = data_dir / "publications.js"
    js_path.write_text(
        f"// Auto-generated {datetime.utcnow().strftime('%Y-%m-%d')} from Google Scholar\n"
        f"window.LAB_PUBLICATIONS = {json.dumps(pubs, indent=2, ensure_ascii=False)};\n"
    )
    print(f"Saved {len(pubs)} publications → {js_path}")
    print(f"Done. Run again in ~6 months.")


if __name__ == "__main__":
    main()

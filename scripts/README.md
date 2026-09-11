# Scripts

## fetch_publications.py

Scrapes your Google Scholar profile and updates `data/publications.json`.

### Setup

```bash
pip install scholarly
```

### Run

```bash
# Find your Scholar ID in the URL:
# https://scholar.google.com/citations?user=XXXXXXXXXXXX
python scripts/fetch_publications.py --scholar-id XXXXXXXXXXXX
```

### Schedule (macOS – every 6 months via cron)

```cron
# Run on Jan 1 and Jul 1 at 8am
0 8 1 1,7 * cd /path/to/LanLab && python scripts/fetch_publications.py --scholar-id YOUR_ID
```

To edit crontab: `crontab -e`

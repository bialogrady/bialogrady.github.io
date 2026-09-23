#!/usr/bin/env python3
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

SOURCE = "https://samorzad.gov.pl/web/gmina-grajewo/informacje-biezace"
OUT = Path(__file__).resolve().parents[1] / "content" / "gmina.json"


def clean(value):
    value = re.sub(r"<[^>]+>", " ", value)
    value = html.unescape(value)
    return re.sub(r"\s+", " ", value).strip()


def main():
    request = Request(SOURCE, headers={"User-Agent": "Bialogrady-Gmina-Updater/1.0"})
    with urlopen(request, timeout=30) as response:
        page = response.read().decode("utf-8", errors="replace")
    cards = re.findall(r"<li>\s*(<a\b.*?</a>)\s*</li>", page, flags=re.I | re.S)
    item = None
    for card in cards:
        href_match = re.search(r'<a\b[^>]*href=["\']([^"\']+)["\']', card, flags=re.I)
        date_match = re.search(r'<span\s+class=["\']date["\']>(.*?)</span>', card, flags=re.I | re.S)
        title_match = re.search(r'<div\s+class=["\']title["\']>(.*?)</div>', card, flags=re.I | re.S)
        intro_match = re.search(r'<div\s+class=["\']intro["\']>(.*?)</div>', card, flags=re.I | re.S)
        if not (href_match and date_match and title_match):
            continue
        href = href_match.group(1)
        if "/web/gmina-grajewo/" not in href:
            continue
        link = href if href.startswith("http") else "https://samorzad.gov.pl" + href
        item = {"title": clean(title_match.group(1)), "date": clean(date_match.group(1)), "description": clean(intro_match.group(1)) if intro_match else "", "link": link}
        break
    if not item:
        raise SystemExit("Nie znaleziono karty artykułu na stronie Gminy Grajewo")
    result = {"source": SOURCE, "fetched_at": datetime.now(timezone.utc).isoformat(), "item": item}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

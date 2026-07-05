# Sendatzki + Rosenthal — Website

Informationswebsite für die **Sendatzki + Rosenthal Autoteile und Lacke GmbH & Co. KG**
(Gelsenkirchen · Wuppertal · Velbert). Statische Multi-Page-Site ohne Build-Schritt.

## Inhalt

Die Website liegt im Ordner [`site/`](site/):

| Seite | Datei |
| --- | --- |
| Start | `site/index.html` |
| Leistungen | `site/leistungen.html` |
| Team | `site/team.html` |
| Über uns | `site/ueber-uns.html` |
| Standorte | `site/standorte.html` |
| Kontakt | `site/kontakt.html` |

- `site/style.css` — komplettes Styling (Marke: Navy `#1D3E6E` + Signalrot `#FF1C28`)
- `site/script.js` — Mobil-Navigation, Hero-Animation, Kundenbewertungen, Kontaktformular
- `site/assets/` — Logo, Fotos und Partner-Logos

## Lokal ansehen

Einfach `site/index.html` im Browser öffnen, oder einen kleinen Server starten:

```powershell
powershell -ExecutionPolicy Bypass -File site/serve.ps1
# dann http://localhost:4173 öffnen
```

## Noch offen

- Echte Fotos für die beschrifteten Bild-Platzhalter (Team, Lieferdienst, Schulung, Standortkarte)
- Telefonnummer Gelsenkirchen gegenprüfen
- Impressum & Datenschutz mit Inhalt füllen
- Optional: Formular-Endpoint (z. B. Formspree) für serverseitigen Versand in `site/kontakt.html` hinterlegen

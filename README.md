# CV & Job Application Assistant

Vitalii Skrypka's CV, plus a Chrome extension + backend that reads the job
posting you're viewing, compares it against the CV, and tracks applications on a
Notion board.

- **CV** — [Vitalii_Skrypka_CV.md](Vitalii_Skrypka_CV.md), served as a page by
  [api/index.ts](api/index.ts) (`standalone.html`) on Vercel.
- **Backend** — [api/](api/): `analyze` (CV ↔ job-description match), `apply`
  (record an application in Notion), `setup` (create the board).
- **Extension** — [extension/](extension/): MV3 side panel + options page.

## Get started

- **Run it end to end:** [SETUP.md](SETUP.md)
- **Domain model:** [GLOSSARY.md](GLOSSARY.md)
- **Key decisions:** [docs/adr/](docs/adr/)

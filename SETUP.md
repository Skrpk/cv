# Setup — CV Job Assistant

End-to-end setup for the whole chain:

```
Chrome extension  ──(x-app-secret)──▶  Vercel backend (api/)  ──▶  Claude / OpenAI
                                             │
                                             └──▶  Notion board   (+ Upstash Redis for config)
```

Work top to bottom. You'll need accounts for: Vercel, Notion, Anthropic, OpenAI,
and Chrome. Roughly 20 minutes the first time.

---

## 1. Notion: integration + a parent page

1. Go to <https://www.notion.so/my-integrations> → **New integration** (internal).
   - Give it a name (e.g. "CV Job Assistant").
   - Under **Capabilities**, enable **Read content**, **Insert content**, and
     **Update content**.
   - Copy the **Internal Integration Secret** — it starts with `ntn_`
     (older ones start with `secret_`). This is your `NOTION_TOKEN`.
2. Create (or pick) a Notion page that will *hold* the board — e.g. a page
   called "Job Hunt". The board will be created as a sub-item of this page.
3. Share that page with the integration: open the page → **•••** (top-right) →
   **Connections** → **Connect to** → select your integration.
   *(If setup later fails with "could not find page", this step was missed.)*
4. Get the **parent page ID**: open the page, copy its URL. The ID is the
   32-character hex string at the end (ignore the title and any `?` query):

   ```
   https://www.notion.so/Job-Hunt-1a2b3c4d5e6f7890abcd1234ef567890
                                  └──────────── parent page ID ───────────┘
   ```

   Dashes in the ID are optional; the backend accepts it either way.

---

## 2. Vercel: the Redis store (config)

The backend remembers your board's ID in Redis.

1. In the Vercel dashboard, open your project → **Storage** → **Create** →
   choose a **Redis** integration from the Marketplace → connect it to this
   project.
2. This injects a **`REDIS_URL`** connection string automatically. The backend
   reads that — no action needed beyond connecting the store (and redeploying so
   the new env var is picked up).

---

## 3. API keys

- **Anthropic**: <https://console.anthropic.com> → API keys → create. This is
  `ANTHROPIC_API_KEY`.
- **OpenAI**: <https://platform.openai.com/api-keys> → create. This is
  `OPENAI_API_KEY`.

---

## 4. Backend env vars

Set these in **Vercel → Project → Settings → Environment Variables** (Production,
and Preview if you use it):

| Variable             | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| `ANTHROPIC_API_KEY`  | from step 3                                                  |
| `OPENAI_API_KEY`     | from step 3                                                  |
| `NOTION_TOKEN`       | the `ntn_…` secret from step 1                               |
| `APP_SHARED_SECRET`  | a long random string you generate (see below)               |

The Redis vars from step 2 are already there. Generate the shared secret with:

```bash
openssl rand -hex 32
```

Keep that value — you'll paste the **same** string into the extension in step 7.

For local development instead of Vercel, copy `.env.example` to `.env.local` and
fill the same values.

---

## 5. Deploy the backend

The backend is the `api/` folder of this repo, deployed as Vercel functions; the
CV page keeps serving at `/`.

1. Import this repo into Vercel (or push to the branch Vercel builds). The new
   functions only exist in production **after** this repo is pushed and built —
   until then `/api/analyze` returns `404 NOT_FOUND` even though the CV page at
   `/` works.
2. **Use the canonical host** (the one with `www`, e.g. `https://www.vit-skr.dev`).
   The bare apex (`vit-skr.dev`) **308-redirects** to `www`, and browsers do not
   follow redirects on a CORS preflight — so pointing the extension at the apex
   makes every call fail. Always use the `www` form below and in step 7.
3. After deploy, check (against the `www` host):
   - `https://<your-domain>/` → your CV page loads.
   - `curl -i -X POST https://<your-domain>/api/analyze` → **401 Unauthorized**.
     That 401 is *correct* — it means the secret guard is active.
   - With the secret, a non-job page should return `{"isJob":false,...}`:
     ```bash
     curl -s -X POST https://<your-domain>/api/analyze \
       -H "content-type: application/json" \
       -H "x-app-secret: <APP_SHARED_SECRET>" \
       -d '{"url":"https://example.com","pageText":"hello world"}'
     ```

---

## 6. Build & load the extension

```bash
cd extension
npm install
npm run build
```

Then in Chrome: `chrome://extensions` → enable **Developer mode** → **Load
unpacked** → select `extension/dist`. Click the toolbar icon to open the side
panel.

---

## 7. Connect the extension

1. In the side panel, click **⚙** (or open the extension's options).
2. Set:
   - **Backend URL** — your deployed **canonical** domain with `www`, e.g.
     `https://www.vit-skr.dev` (no trailing `/api`, and not the bare apex —
     see step 5.2).
   - **Shared secret** — the exact `APP_SHARED_SECRET` from step 4.
   - **Save**.

---

## 8. Create the Notion board (one-time)

1. In the options page, paste the **parent page ID** from step 1.
2. Click **Create my Notion board**.
3. Check Notion: a "Job Applications" board appears under your parent page, with
   a **Status** property holding the 7 stages.

> **Grouping:** the stages are created as options; Notion may put them in a single
> group. To get the To-do / In-progress / Complete kanban lanes, open the board's
> Status property once and drag the stages into groups. (Cosmetic, one-time.)

---

## 9. Use it

On a job posting, open the side panel → **Analyze this page**. Toggle
Claude/OpenAI if you like. When you apply, click **Mark as Applied** — a card is
created on the board (or updated if you'd saved that URL before).

---

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `404 NOT_FOUND` on `/api/*` (but `/` works) | The new backend isn't deployed yet. Push/deploy the branch Vercel builds. |
| `308` redirect / CORS preflight failure | You're pointing at the bare apex. Use the canonical `www` host (step 5.2). |
| `401 Unauthorized` | The extension's secret ≠ `APP_SHARED_SECRET`. Re-save in options. |
| `500 Missing ANTHROPIC_API_KEY` (or OPENAI/NOTION) | Env var not set, or the project wasn't redeployed after setting it. |
| `No board configured. Run /api/setup first.` | Do step 8. If the board ID was lost, run it again. |
| Notion "could not find page" / "not shared" | Share the parent page with the integration (step 1.3). |
| Setup errors on the **Status** property | Known risk: the Notion API must accept a status property with custom options (it does on API `2025-09-03`). If it's rejected, note the exact error — the fix is to switch the board's stage field to a Select (small backend change in `createBoard` + the apply payload). |
| "No active tab to read" / analysis is empty | `activeTab` doesn't cover `chrome://` pages, the Chrome Web Store, or some PDFs. Open the panel from a normal web page. |
| Analysis returns `isJob: false` on a real posting | The page may be behind a login wall so the visible text isn't the JD. Make sure the posting is actually rendered. |

---

## What's intentionally not built yet

Tailor (JD-specific cover letter + CV tweaks) and Follow-up nudges (stale-stage
flags) are future features — the schema and config already accommodate them.
See [GLOSSARY.md](GLOSSARY.md) and [docs/adr/0001-notion-as-source-of-truth.md](docs/adr/0001-notion-as-source-of-truth.md).

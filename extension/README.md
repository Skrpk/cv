# CV Job Assistant — Chrome extension

MV3 extension (Vite + React + TypeScript). Side panel analyzes the job posting
on the current tab against your CV; "Mark as Applied" records it on your Notion
board. Talks only to your own backend (see `../api`).

## Build

```bash
cd extension
npm install
npm run build        # outputs dist/
```

## Load in Chrome

1. Open `chrome://extensions`, enable **Developer mode**.
2. **Load unpacked** → select `extension/dist`.
3. Click the toolbar icon to open the side panel.
4. Open **Settings** (⚙ in the panel, or the extension's options) and set:
   - **Backend URL** — your deployed backend (e.g. `https://your-site.vercel.app`)
   - **Shared secret** — the `APP_SHARED_SECRET` you set on the backend
5. One-time: share a Notion page with your integration, paste its page ID, and
   click **Create my Notion board**.

## Use

On a job posting, open the panel and click **Analyze this page**. Toggle
Claude/OpenAI as you like. When you apply, click **Mark as Applied**.

## Permissions

`activeTab` + `scripting`, `sidePanel`, `storage` at install time. Host access
to read page contents is **optional** and requested on demand: the first time
you click **Analyze**, Chrome asks to allow reading site data — choose **Allow**
once and it applies to later analyses. Backend calls need no host permission
(the backend's CORS allows them).

## Dev watch

```bash
npm run dev          # rebuilds dist/ on change; reload the extension in Chrome
```

import { useEffect, useState } from "react";
import * as api from "../lib/api";
import { getSettings, setSettings } from "../lib/storage";

export function Options() {
  const [backendUrl, setBackendUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [saved, setSaved] = useState(false);

  const [parentPageId, setParentPageId] = useState("");
  const [boardBusy, setBoardBusy] = useState(false);
  const [boardMsg, setBoardMsg] = useState<string | null>(null);
  const [boardErr, setBoardErr] = useState<string | null>(null);

  useEffect(() => {
    getSettings().then((s) => {
      setBackendUrl(s.backendUrl);
      setSecret(s.secret);
    });
  }, []);

  async function save() {
    await setSettings({ backendUrl: backendUrl.trim(), secret: secret.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function createBoard() {
    setBoardBusy(true);
    setBoardMsg(null);
    setBoardErr(null);
    try {
      await save(); // ensure latest settings are stored before the call
      const result = await api.setup(parentPageId.trim());
      setBoardMsg(
        result.created
          ? "Board created. You're ready to track applications."
          : "Board is configured.",
      );
    } catch (e) {
      setBoardErr(e instanceof Error ? e.message : "Could not create the board.");
    } finally {
      setBoardBusy(false);
    }
  }

  return (
    <div className="wrap">
      <h1>CV Job Assistant — Settings</h1>

      <h2>Backend</h2>
      <label htmlFor="url">Backend URL</label>
      <input
        id="url"
        placeholder="https://your-cv-site.vercel.app"
        value={backendUrl}
        onChange={(e) => setBackendUrl(e.target.value)}
      />
      <label htmlFor="secret">Shared secret</label>
      <input
        id="secret"
        type="password"
        placeholder="the APP_SHARED_SECRET you set on the backend"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
      />
      <div className="row" style={{ marginTop: 12 }}>
        <button onClick={save}>Save</button>
        {saved && <span className="ok">Saved ✓</span>}
      </div>

      <h2>Notion board</h2>
      <p className="muted">
        One-time: create the kanban board. Share a Notion page with your
        integration, then paste that page's ID below.
      </p>
      <label htmlFor="parent">Parent page ID</label>
      <input
        id="parent"
        placeholder="32-character Notion page id"
        value={parentPageId}
        onChange={(e) => setParentPageId(e.target.value)}
      />
      <div className="row" style={{ marginTop: 12 }}>
        <button onClick={createBoard} disabled={boardBusy || !parentPageId.trim()}>
          {boardBusy ? "Creating…" : "Create my Notion board"}
        </button>
        {boardMsg && <span className="ok">{boardMsg}</span>}
      </div>
      {boardErr && <div className="error">{boardErr}</div>}
    </div>
  );
}

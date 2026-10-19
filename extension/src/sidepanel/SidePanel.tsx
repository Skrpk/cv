import { useEffect, useState } from "react";
import * as api from "../lib/api";
import { captureActiveTab, ensurePageAccess } from "../lib/page";
import { getSettings, isConfigured } from "../lib/storage";
import type { Analysis, ApplyResult, ProviderName } from "../lib/types";

export function SidePanel() {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [provider, setProvider] = useState<ProviderName>("claude");
  const [busy, setBusy] = useState<"analyze" | "apply" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [pageUrl, setPageUrl] = useState<string>("");
  const [applied, setApplied] = useState<ApplyResult | null>(null);

  useEffect(() => {
    getSettings().then((s) => setConfigured(isConfigured(s)));
  }, []);

  async function onAnalyze() {
    setBusy("analyze");
    setError(null);
    setApplied(null);
    setAnalysis(null);
    try {
      await ensurePageAccess(); // must be first — keeps the click's user gesture
      const page = await captureActiveTab();
      setPageUrl(page.url);
      const result = await api.analyze({ ...page, provider });
      setAnalysis(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setBusy(null);
    }
  }

  async function onApply() {
    if (!analysis) return;
    setBusy("apply");
    setError(null);
    try {
      const result = await api.apply({ url: pageUrl, analysis });
      setApplied(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Saving to Notion failed.");
    } finally {
      setBusy(null);
    }
  }

  if (configured === false) {
    return (
      <div className="wrap">
        <h1>CV Job Assistant</h1>
        <p className="muted">
          First, add your backend URL and secret in the extension settings.
        </p>
        <button onClick={() => chrome.runtime.openOptionsPage()}>Open settings</button>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="row">
        <h1>CV Job Assistant</h1>
        <span className="spacer" />
        <button
          className="secondary"
          title="Settings"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          ⚙
        </button>
      </div>

      <div className="row" style={{ marginTop: 8 }}>
        <div className="toggle" role="group" aria-label="Model provider">
          <button
            className={provider === "claude" ? "active" : ""}
            onClick={() => setProvider("claude")}
          >
            Claude
          </button>
          <button
            className={provider === "openai" ? "active" : ""}
            onClick={() => setProvider("openai")}
          >
            OpenAI
          </button>
        </div>
        <span className="spacer" />
        <button onClick={onAnalyze} disabled={busy !== null}>
          {busy === "analyze" ? "Analyzing…" : "Analyze this page"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {analysis && !analysis.isJob && (
        <div className="card">
          <p className="muted">{analysis.summary}</p>
        </div>
      )}

      {analysis && analysis.isJob && (
        <>
          <div className="card">
            <div className="score">
              <span className="num">{analysis.matchScore}</span>
              <span className="den">/ 100 match</span>
            </div>
            <div className="bar">
              <span style={{ width: `${analysis.matchScore}%` }} />
            </div>
            {(analysis.role || analysis.company) && (
              <p className="muted" style={{ marginTop: 8 }}>
                {[analysis.role, analysis.company].filter(Boolean).join(" · ")}
              </p>
            )}
            <p style={{ marginTop: 8 }}>{analysis.summary}</p>
          </div>

          {analysis.strengths.length > 0 && (
            <>
              <h2>Strengths</h2>
              <ul>
                {analysis.strengths.map((s, i) => (
                  <li className="good" key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {analysis.gaps.length > 0 && (
            <>
              <h2>Gaps</h2>
              <ul>
                {analysis.gaps.map((g, i) => (
                  <li className="bad" key={i}>{g}</li>
                ))}
              </ul>
            </>
          )}

          {analysis.tips.length > 0 && (
            <>
              <h2>Tailoring tips</h2>
              <ul>
                {analysis.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </>
          )}

          <div className="row" style={{ marginTop: 16 }}>
            <button onClick={onApply} disabled={busy !== null || applied !== null}>
              {busy === "apply"
                ? "Saving…"
                : applied
                  ? "Saved to Notion ✓"
                  : "Mark as Applied"}
            </button>
            {applied && (
              <a href={applied.pageUrl} target="_blank" rel="noreferrer">
                Open card ({applied.action})
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}

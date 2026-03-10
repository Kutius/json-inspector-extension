import { useEffect, useState, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import type { JsonValue } from "@visual-json/core";
import { JsonEditor } from "@visual-json/react";
import "./styles.css";

const ROOT_ID = "visual-json-browser-extension-root";
const PAGE_MARKER = "data-visual-json-browser-extension";

const VIEWER_THEME_STYLE = {
  "--vj-bg": "var(--vj-browser-editor-bg)",
  "--vj-bg-panel": "var(--vj-browser-panel-bg)",
  "--vj-bg-hover": "var(--vj-browser-hover-bg)",
  "--vj-bg-selected": "var(--vj-browser-selected-bg)",
  "--vj-bg-selected-muted": "var(--vj-browser-selected-muted-bg)",
  "--vj-bg-match": "var(--vj-browser-match-bg)",
  "--vj-bg-match-active": "var(--vj-browser-match-active-bg)",
  "--vj-border": "var(--vj-browser-border)",
  "--vj-border-subtle": "var(--vj-browser-border-subtle)",
  "--vj-text": "var(--vj-browser-text)",
  "--vj-text-muted": "var(--vj-browser-text-muted)",
  "--vj-text-dim": "var(--vj-browser-text-dim)",
  "--vj-text-dimmer": "var(--vj-browser-text-dimmer)",
  "--vj-string": "var(--vj-browser-string)",
  "--vj-number": "var(--vj-browser-number)",
  "--vj-boolean": "var(--vj-browser-boolean)",
  "--vj-accent": "var(--vj-browser-accent)",
  "--vj-accent-muted": "var(--vj-browser-selected-muted-bg)",
  "--vj-input-bg": "var(--vj-browser-accent)",
  "--vj-input-border": "var(--vj-browser-accent-border)",
  "--vj-error": "var(--vj-browser-error)",
  "--vj-font":
    'ui-monospace, "SFMono-Regular", "Cascadia Code", "JetBrains Mono", monospace',
  "--vj-input-font-size": "12px",
} as CSSProperties;

interface JsonDocumentInfo {
  title: string;
  sourceUrl: string;
  contentType: string;
  rawText: string;
  value: JsonValue;
}

function formatBytes(byteCount: number) {
  if (byteCount < 1024) return `${byteCount} B`;
  if (byteCount < 1024 * 1024) return `${(byteCount / 1024).toFixed(1)} KB`;
  return `${(byteCount / (1024 * 1024)).toFixed(1)} MB`;
}

function describeRoot(value: JsonValue) {
  if (Array.isArray(value)) {
    return `${value.length} items`;
  }

  if (value && typeof value === "object") {
    return `${Object.keys(value).length} keys`;
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

function getDocumentTitle() {
  const pathname = window.location.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  const fallbackTitle = lastSegment || "document.json";

  try {
    return decodeURIComponent(fallbackTitle);
  } catch {
    return fallbackTitle;
  }
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, value.length);

    try {
      return document.execCommand("copy");
    } finally {
      textarea.remove();
    }
  }
}

function extractRawText() {
  const { body } = document;

  if (!body) {
    return null;
  }

  const pre = body.querySelector("pre");

  const rawText = (pre?.textContent ?? body.textContent ?? "")
    .replace(/^\uFEFF/, "")
    .trim();

  return rawText || null;
}

function shouldTransformDocument() {
  const contentType = (document.contentType || "").toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  return (
    contentType.includes("json") ||
    pathname.endsWith(".json") ||
    pathname.endsWith(".geojson")
  );
}

function readJsonDocument(): JsonDocumentInfo | null {
  if (!shouldTransformDocument()) {
    return null;
  }

  const rawText = extractRawText();

  if (!rawText) {
    return null;
  }

  try {
    return {
      title: getDocumentTitle(),
      sourceUrl: window.location.href,
      contentType: document.contentType || "application/json",
      rawText,
      value: JSON.parse(rawText) as JsonValue,
    };
  } catch {
    return null;
  }
}

function JsonDocumentApp({ info }: { info: JsonDocumentInfo }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [viewMode, setViewMode] = useState<"tree" | "raw">("tree");

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timer = window.setTimeout(() => setCopyState("idle"), 1600);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const rootSummary = describeRoot(info.value);
  const byteSize = formatBytes(new TextEncoder().encode(info.rawText).length);

  async function handleCopy() {
    const didCopy = await copyText(info.rawText);
    setCopyState(didCopy ? "copied" : "failed");
  }

  const copyIcon = (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );

  const checkIcon = (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const alertIcon = (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );

  return (
    <div className="vjb-shell">
      <header className="vjb-header">
        <div className="vjb-header__meta">
          <span className="vjb-badge">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            visual-json
          </span>
          <h1>{info.title}</h1>
          <p>{info.sourceUrl}</p>
        </div>
        <div className="vjb-header__actions">
          <div className="vjb-view-toggle">
            <button
              type="button"
              className={viewMode === "tree" ? "is-active" : ""}
              onClick={() => setViewMode("tree")}
            >
              Tree
            </button>
            <button
              type="button"
              className={viewMode === "raw" ? "is-active" : ""}
              onClick={() => setViewMode("raw")}
            >
              Raw
            </button>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className={`vjb-copy-button ${copyState !== "idle" ? `is-${copyState}` : ""}`}
          >
            {copyState === "copied"
              ? checkIcon
              : copyState === "failed"
                ? alertIcon
                : copyIcon}
            <span>
              {copyState === "copied"
                ? "Copied"
                : copyState === "failed"
                  ? "Copy Failed"
                  : "Copy Raw"}
            </span>
          </button>
        </div>
      </header>
      <section className="vjb-stats" aria-label="JSON metadata">
        <div className="vjb-stats__item">
          <span>Root:</span>
          <strong>{rootSummary}</strong>
        </div>
        <div className="vjb-stats__item">
          <span>Size:</span>
          <strong>{byteSize}</strong>
        </div>
        <div className="vjb-stats__item">
          <span>Type:</span>
          <strong>{info.contentType}</strong>
        </div>
      </section>
      <main className="vjb-editor">
        {viewMode === "tree" ? (
          <JsonEditor
            value={info.value}
            readOnly
            treeShowValues
            sidebarOpen
            style={VIEWER_THEME_STYLE}
          />
        ) : (
          <pre className="vjb-raw-view">{info.rawText}</pre>
        )}
      </main>
    </div>
  );
}

function mountViewer(info: JsonDocumentInfo) {
  if (document.documentElement.getAttribute(PAGE_MARKER) === "mounted") {
    return;
  }

  document.documentElement.setAttribute(PAGE_MARKER, "mounted");
  document.documentElement.classList.add("vjb-document");
  document.body.classList.add("vjb-document");

  const root = document.createElement("div");
  root.id = ROOT_ID;

  document.body.replaceChildren(root);
  document.title = `${info.title} · visual-json`;

  createRoot(root).render(<JsonDocumentApp info={info} />);
}

const info = readJsonDocument();

if (info) {
  mountViewer(info);
}

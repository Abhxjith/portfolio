"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

const COMMAND = "npx abhijith";
const COPIED_MESSAGE = "Paste in terminal :3";

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function MoreSection() {
  const [copied, setCopied] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [fading, setFading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const copy = useCallback(async () => {
    let didCopy = false;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(COMMAND);
        didCopy = true;
      }
    } catch {
      /* clipboard API failed (e.g. non-HTTPS), try fallback */
    }
    if (!didCopy && typeof document !== "undefined") {
      try {
        const ta = document.createElement("textarea");
        ta.value = COMMAND;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        didCopy = true;
      } catch {
        /* fallback copy failed */
      }
    }
    setCopied(didCopy);
    setShowNotification(true);
    setFading(false);
    setTimeout(() => setCopied(false), 1500);
    setTimeout(() => setFading(true), 1500);
    setTimeout(() => setShowNotification(false), 2100);
  }, []);

  const portalTarget =
    mounted && typeof document !== "undefined"
      ? document.body
      : null;
  const notificationEl =
    showNotification && portalTarget
      ? createPortal(
          <div
            className={`more-copy-notification${fading ? " more-copy-notification-fade-out" : ""}`}
            role="status"
            aria-live="polite"
          >
            {COPIED_MESSAGE}
          </div>,
          portalTarget
        )
      : null;

  return (
    <>
      <div className="more-section">
        <div className="more-command-wrap">
          <div className="more-command">
            <span className="more-prompt">%</span>
            <code>{COMMAND}</code>
          </div>
          <button
            type="button"
            className="more-copy-btn"
            onClick={copy}
            aria-label={`Copy ${COMMAND}`}
            title="Copy"
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
        </div>
      </div>
      {notificationEl}
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const CLOSE_DURATION = 150;

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className = "",
}) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [closing, setClosing] = useState(false);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, CLOSE_DURATION);
  };

  // ── Focus trap ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const el = contentRef.current;
    if (!el) return;

    const focusable = [...el.querySelectorAll(FOCUSABLE)];
    focusable[0]?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") { handleClose(); return; }
      if (e.key !== "Tab") return;
      if (focusable.length === 0) { e.preventDefault(); return; }
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      prev?.focus();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // ── Scroll lock ───────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex"
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm ${closing ? "animate-backdrop-out" : "animate-backdrop-in"}`}
        aria-hidden="true"
      />

      {/* ── Desktop: center ── Mobile: bottom sheet ─────────────────── */}
      <div className={[
        // Mobile: pin to bottom
        "sm:hidden relative w-full mt-auto",
        closing
          ? "animate-[slide-out-down_150ms_ease-in_both]"
          : "animate-[slide-in-up_200ms_cubic-bezier(0.4,0,0.2,1)_both]",
      ].join(" ")}>
        <Sheet
          ref={contentRef}
          title={title}
          footer={footer}
          className={`rounded-t-2xl ${className}`}
          onClose={handleClose}
        >
          {children}
        </Sheet>
      </div>

      <div className={[
        // Desktop: center
        "hidden sm:flex items-center justify-center w-full p-4",
      ].join(" ")}>
        <Sheet
          ref={contentRef}
          title={title}
          footer={footer}
          className={`w-full max-w-md rounded-xl ${closing ? "animate-modal-out" : "animate-modal-in"} ${className}`}
          onClose={handleClose}
        >
          {children}
        </Sheet>
      </div>
    </div>,
    document.body
  );
}

// ── Inner panel (shared by both layouts) ─────────────────────────────────────

import { forwardRef } from "react";

const Sheet = forwardRef(function Sheet({ title, children, footer, className, onClose }, ref) {
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      className={`bg-white shadow-xl ${className}`}
    >
      {/* Drag handle — mobile only */}
      <div className="sm:hidden flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 bg-gray-200 rounded-full" />
      </div>

      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 id="modal-title" className="text-base font-semibold text-neutral-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Body */}
      <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/50">
          {footer}
        </div>
      )}
    </div>
  );
});

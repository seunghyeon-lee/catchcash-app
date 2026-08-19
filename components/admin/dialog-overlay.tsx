"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";

interface DialogOverlayProps {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  describedBy?: string;
  children: ReactNode;
  className?: string;
}

export function DialogOverlay({ open, onClose, labelledBy, describedBy, children, className }: DialogOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onCloseRef.current();
      return;
    }

    if (event.key !== "Tab" || !panelRef.current) return;

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const timer = window.setTimeout(() => {
      if (!panelRef.current) return;
      const firstFocusable = panelRef.current.querySelector<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href], textarea:not([disabled]), input:not([disabled]), select:not([disabled])',
      );
      firstFocusable?.focus();
    }, 0);

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCloseRef.current();
      }}
    >
      <div ref={panelRef} className={className ?? "w-full max-w-md rounded-lg bg-white p-6 shadow-xl"} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

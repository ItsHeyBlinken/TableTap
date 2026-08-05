import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";

export interface MobileMenuItem {
  label: string;
  to: string;
  variant?: "default" | "primary";
  onClick?: () => void;
}

interface MobileMenuProps {
  items: MobileMenuItem[];
  /** Screen-reader label for the menu panel */
  menuLabel?: string;
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

export function MobileMenu({ items, menuLabel = "Navigation menu" }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  const overlay =
    open &&
    createPortal(
      <>
        <button
          type="button"
          className="fixed inset-0 z-[100] bg-slate-900/50"
          aria-label="Close menu"
          onClick={close}
        />
        <nav
          id={panelId}
          aria-label={menuLabel}
          className="fixed inset-y-0 right-0 z-[110] flex w-[min(100vw,300px)] flex-col border-l border-slate-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
            <span className="text-base font-semibold text-slate-900">Menu</span>
            <button
              type="button"
              onClick={close}
              className="touch-target rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <MenuIcon open />
            </button>
          </div>
          <ul className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
            {items.map((item) => (
              <li key={item.to + item.label}>
                {item.onClick ? (
                  <button
                    type="button"
                    onClick={() => {
                      item.onClick?.();
                      close();
                    }}
                    className="touch-target w-full rounded-lg px-4 py-3.5 text-left text-base font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    to={item.to}
                    onClick={close}
                    className={`touch-target block rounded-lg px-4 py-3.5 text-base font-medium ${
                      item.variant === "primary"
                        ? "bg-brand-600 text-white hover:bg-brand-700"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </>,
      document.body
    );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="touch-target inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-slate-100"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? "Close menu" : "Open menu"}
      >
        <MenuIcon open={open} />
      </button>
      {overlay}
    </div>
  );
}

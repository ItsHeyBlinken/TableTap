/** User-facing product name (UI only). Internal packages/docs use ShowPOS. */
export const APP_DISPLAY_NAME = "TableTap";

/** In-app support (beta). Hardcoded so it does not depend on VITE_FEEDBACK_EMAIL. */
export const SUPPORT_EMAIL = "info@bytesbyblinken.com";

/** Optional — enables mailto on /pricing for vendor feedback */
export const FEEDBACK_EMAIL = import.meta.env.VITE_FEEDBACK_EMAIL as string | undefined;

/** mailto: for beta support; optional body prefill (e.g. account email). */
export function supportMailto(accountEmail?: string | null): string {
  const subject = encodeURIComponent("TableTap beta: ");
  const body = accountEmail
    ? encodeURIComponent(`Account email: ${accountEmail}\n\n`)
    : "";
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}${body ? `&body=${body}` : ""}`;
}

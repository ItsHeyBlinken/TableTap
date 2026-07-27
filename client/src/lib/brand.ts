/** User-facing product name (UI only). Internal packages/docs use ShowPOS. */
export const APP_DISPLAY_NAME = "TableTap";

/** Optional — enables mailto on /pricing for vendor feedback */
export const FEEDBACK_EMAIL = import.meta.env.VITE_FEEDBACK_EMAIL as string | undefined;

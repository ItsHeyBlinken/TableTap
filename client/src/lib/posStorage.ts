const LAST_EVENT_KEY = "showpos_last_event_id";

export function getLastEventId(): string {
  try {
    return localStorage.getItem(LAST_EVENT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setLastEventId(eventId: string): void {
  try {
    if (eventId) localStorage.setItem(LAST_EVENT_KEY, eventId);
    else localStorage.removeItem(LAST_EVENT_KEY);
  } catch {
    /* ignore */
  }
}

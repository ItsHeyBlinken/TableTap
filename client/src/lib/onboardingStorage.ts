const WELCOME_SEEN_KEY = "tabletap_welcome_seen";
const CHECKLIST_DISMISSED_KEY = "tabletap_checklist_dismissed";

export function isWelcomeSeen(): boolean {
  return localStorage.getItem(WELCOME_SEEN_KEY) === "1";
}

export function setWelcomeSeen(): void {
  localStorage.setItem(WELCOME_SEEN_KEY, "1");
}

export function isChecklistDismissed(): boolean {
  return localStorage.getItem(CHECKLIST_DISMISSED_KEY) === "1";
}

export function dismissChecklist(): void {
  localStorage.setItem(CHECKLIST_DISMISSED_KEY, "1");
}

export function resetChecklistDismissed(): void {
  localStorage.removeItem(CHECKLIST_DISMISSED_KEY);
}

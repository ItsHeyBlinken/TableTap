export interface CartLine {
  cardId: string;
  label: string;
  quantity: number;
  unitPrice: number;
  maxQuantity: number;
  purchasePrice: number;
}

const KEY = "tabletap_pos_cart";

export function loadCart(): CartLine[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCart(lines: CartLine[]): void {
  sessionStorage.setItem(KEY, JSON.stringify(lines));
}

export function clearCart(): void {
  sessionStorage.removeItem(KEY);
}

export function mergeLine(lines: CartLine[], next: CartLine): CartLine[] {
  const i = lines.findIndex((l) => l.cardId === next.cardId);
  if (i < 0) return [...lines, next];
  const existing = lines[i];
  const maxQuantity = next.maxQuantity;
  const quantity = Math.min(maxQuantity, existing.quantity + next.quantity);
  const unitPrice = next.unitPrice;
  const copy = [...lines];
  copy[i] = {
    ...existing,
    quantity,
    unitPrice,
    maxQuantity,
    label: next.label,
    purchasePrice: next.purchasePrice,
  };
  return copy;
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
}

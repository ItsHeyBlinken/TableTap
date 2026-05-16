export function formatCurrency(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function cardLabel(card: { player_name: string; year: number; brand: string }): string {
  return `${card.player_name} — ${card.year} ${card.brand}`;
}

export function previewProfit(soldPrice: number, costBasis: number): number {
  return soldPrice - costBasis;
}

export const emptyCardForm = {
  player_name: "",
  year: new Date().getFullYear().toString(),
  brand: "",
  card_number: "",
  sport: "",
  team: "",
  condition: "",
  graded: false,
  grading_company: "",
  grade: "",
  purchase_price: "",
  quantity: "1",
  notes: "",
  image_url: "",
};

export function cardToForm(card: import("../types").Card) {
  return {
    player_name: card.player_name,
    year: String(card.year),
    brand: card.brand,
    card_number: card.card_number ?? "",
    sport: card.sport ?? "",
    team: card.team ?? "",
    condition: card.condition ?? "",
    graded: card.graded,
    grading_company: card.grading_company ?? "",
    grade: card.grade ?? "",
    purchase_price: card.purchase_price ? String(card.purchase_price) : "",
    quantity: String(card.quantity),
    notes: card.notes ?? "",
    image_url: card.image_url ?? "",
  };
}

export function formToPayload(form: import("../types").CardFormData) {
  return {
    player_name: form.player_name,
    year: Number(form.year),
    brand: form.brand,
    estimated_value: 0,
    card_number: form.card_number || null,
    sport: form.sport || null,
    team: form.team || null,
    condition: form.condition || null,
    graded: form.graded,
    grading_company: form.graded ? form.grading_company || null : null,
    grade: form.graded ? form.grade || null : null,
    purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
    quantity: Number(form.quantity) || 1,
    notes: form.notes || null,
    image_url: form.image_url || null,
  };
}

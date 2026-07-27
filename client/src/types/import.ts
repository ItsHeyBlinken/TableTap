export interface ImportRowResult {
  row: number;
  ok: boolean;
  card_id?: string;
  errors?: string[];
}

export interface ImportCardsResult {
  imported: number;
  failed: number;
  results: ImportRowResult[];
}

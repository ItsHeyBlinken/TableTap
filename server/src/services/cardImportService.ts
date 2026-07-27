import { parse } from "csv-parse/sync";
import { ZodError } from "zod";
import { createCard } from "./cardService.js";
import { importCardRowSchema } from "../utils/validation.js";

export const IMPORT_MAX_FILE_BYTES = 2 * 1024 * 1024;
export const IMPORT_MAX_ROWS = 500;

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

const KNOWN_COLUMNS = new Set([
  "player_name",
  "year",
  "brand",
  "purchase_price",
  "estimated_value",
  "quantity",
  "sport",
  "team",
  "card_number",
  "condition",
  "graded",
  "grading_company",
  "grade",
  "notes",
  "image_url",
]);

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

function emptyToUndefined(value: unknown): unknown {
  if (value == null) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return value;
}

function parseGraded(value: unknown): boolean | undefined {
  if (value == null || String(value).trim() === "") return undefined;
  const v = String(value).trim().toLowerCase();
  if (["true", "yes", "1", "y"].includes(v)) return true;
  if (["false", "no", "0", "n"].includes(v)) return false;
  return undefined;
}

function zodErrorsToMessages(err: ZodError): string[] {
  return err.issues.map((issue) => {
    const path = issue.path.length ? `${issue.path.join(".")}: ` : "";
    return `${path}${issue.message}`;
  });
}

function mapRecordToRowInput(record: Record<string, unknown>): Record<string, unknown> {
  const graded = parseGraded(record.graded);
  const raw: Record<string, unknown> = {
    player_name: emptyToUndefined(record.player_name),
    year: emptyToUndefined(record.year),
    brand: emptyToUndefined(record.brand),
    purchase_price: emptyToUndefined(record.purchase_price),
    estimated_value: emptyToUndefined(record.estimated_value),
    quantity: emptyToUndefined(record.quantity),
    sport: emptyToUndefined(record.sport),
    team: emptyToUndefined(record.team),
    card_number: emptyToUndefined(record.card_number),
    condition: emptyToUndefined(record.condition),
    grading_company: emptyToUndefined(record.grading_company),
    grade: emptyToUndefined(record.grade),
    notes: emptyToUndefined(record.notes),
    image_url: emptyToUndefined(record.image_url),
  };
  if (graded !== undefined) raw.graded = graded;
  return raw;
}

export function importCardsFromCsv(userId: string, fileBuffer: Buffer): Promise<ImportCardsResult> {
  let records: Record<string, string>[];

  try {
    const parsed = parse(fileBuffer, {
      columns: (headers: string[]) => headers.map(normalizeHeader),
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
      bom: true,
    }) as Record<string, string>[];

    records = parsed;
  } catch {
    return Promise.resolve({
      imported: 0,
      failed: 0,
      results: [{ row: 0, ok: false, errors: ["Could not parse CSV file"] }],
    });
  }

  if (records.length === 0) {
    return Promise.resolve({
      imported: 0,
      failed: 0,
      results: [{ row: 0, ok: false, errors: ["CSV has no data rows"] }],
    });
  }

  if (records.length > IMPORT_MAX_ROWS) {
    return Promise.resolve({
      imported: 0,
      failed: 0,
      results: [
        {
          row: 0,
          ok: false,
          errors: [`CSV exceeds maximum of ${IMPORT_MAX_ROWS} rows per import`],
        },
      ],
    });
  }

  const firstKeys = Object.keys(records[0] ?? {});
  const unknownColumns = firstKeys.filter((k) => !KNOWN_COLUMNS.has(k));
  if (unknownColumns.length > 0) {
    return Promise.resolve({
      imported: 0,
      failed: 0,
      results: [
        {
          row: 0,
          ok: false,
          errors: [`Unknown column(s): ${unknownColumns.join(", ")}. Use the import template.`],
        },
      ],
    });
  }

  return importRows(userId, records);
}

async function importRows(
  userId: string,
  records: Record<string, string>[]
): Promise<ImportCardsResult> {
  const results: ImportRowResult[] = [];
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < records.length; i++) {
    const rowNumber = i + 2; // 1 = header, data starts at line 2
    const record = records[i];

    const isBlank = Object.values(record).every((v) => !v || String(v).trim() === "");
    if (isBlank) continue;

    try {
      const input = importCardRowSchema.parse(mapRecordToRowInput(record));
      const card = await createCard(userId, input);
      results.push({ row: rowNumber, ok: true, card_id: card.id });
      imported++;
    } catch (err) {
      failed++;
      if (err instanceof ZodError) {
        results.push({ row: rowNumber, ok: false, errors: zodErrorsToMessages(err) });
      } else if (err instanceof Error) {
        results.push({ row: rowNumber, ok: false, errors: [err.message] });
      } else {
        results.push({ row: rowNumber, ok: false, errors: ["Import failed"] });
      }
    }
  }

  if (results.length === 0) {
    return {
      imported: 0,
      failed: 0,
      results: [{ row: 0, ok: false, errors: ["CSV has no data rows"] }],
    };
  }

  return { imported, failed, results };
}

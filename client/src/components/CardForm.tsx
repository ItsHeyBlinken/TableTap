import { useState } from "react";
import type { CardFormData } from "../types";
import { apiUpload } from "../lib/api";
import {
  CARD_BRANDS,
  CARD_CONDITIONS,
  CARD_GRADES,
  CARD_SPORTS,
  GRADING_COMPANIES,
  STOCK_QUANTITIES,
  getCardYearOptions,
} from "../lib/stockOptions";
import { FormDatalistInput, FormSelect } from "./FormSelect";

interface CardFormProps {
  initial: CardFormData;
  onSubmit: (data: CardFormData) => Promise<void>;
  submitLabel: string;
}

const YEAR_OPTIONS = getCardYearOptions();

export function CardForm({ initial, onSubmit, submitLabel }: CardFormProps) {
  const [form, setForm] = useState<CardFormData>(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const update = (field: keyof CardFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await apiUpload(file);
      update("image_url", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "input-mobile w-full rounded-lg border border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Player name *</label>
          <input
            required
            className={inputClass}
            value={form.player_name}
            onChange={(e) => update("player_name", e.target.value)}
          />
        </div>

        <FormSelect
          label="Year *"
          value={form.year}
          onChange={(v) => update("year", v)}
          options={YEAR_OPTIONS}
          placeholder="Select year"
          required
        />

        <FormDatalistInput
          label="Brand / set *"
          value={form.brand}
          onChange={(v) => update("brand", v)}
          options={CARD_BRANDS}
          placeholder="Pick or type set name"
          listId="stock-brands"
          required
        />

        <div>
          <label className="mb-1 block text-sm font-medium">Card number</label>
          <input
            className={inputClass}
            value={form.card_number}
            onChange={(e) => update("card_number", e.target.value)}
            placeholder="e.g. 250"
          />
        </div>

        <FormSelect
          label="Sport"
          value={form.sport}
          onChange={(v) => update("sport", v)}
          options={CARD_SPORTS}
          placeholder="Select sport"
        />

        <div>
          <label className="mb-1 block text-sm font-medium">Team</label>
          <input
            className={inputClass}
            value={form.team}
            onChange={(e) => update("team", e.target.value)}
            placeholder="Optional"
          />
        </div>

        <FormSelect
          label="Condition"
          value={form.condition}
          onChange={(v) => update("condition", v)}
          options={CARD_CONDITIONS}
          placeholder="Select condition"
        />

        <div>
          <label className="mb-1 block text-sm font-medium">Cost basis (what you paid) *</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            className={inputClass}
            value={form.purchase_price}
            onChange={(e) => update("purchase_price", e.target.value)}
            placeholder="Used to calculate profit on sale"
          />
        </div>

        <FormSelect
          label="Quantity"
          value={form.quantity}
          onChange={(v) => update("quantity", v)}
          options={STOCK_QUANTITIES}
          placeholder="1"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="graded"
          checked={form.graded}
          onChange={(e) => update("graded", e.target.checked)}
        />
        <label htmlFor="graded" className="text-sm font-medium">
          Graded (slab)
        </label>
      </div>

      {form.graded && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect
            label="Grading company"
            value={form.grading_company}
            onChange={(v) => update("grading_company", v)}
            options={GRADING_COMPANIES}
            placeholder="Select company"
          />
          <FormSelect
            label="Grade"
            value={form.grade}
            onChange={(v) => update("grade", v)}
            options={CARD_GRADES}
            placeholder="Select grade"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Notes</label>
        <textarea
          rows={3}
          className={inputClass}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className="text-sm" />
        {uploading && <p className="mt-1 text-xs text-slate-500">Uploading...</p>}
        {form.image_url && (
          <img src={form.image_url} alt="Card preview" className="mt-2 h-32 rounded-lg object-cover" />
        )}
        <input
          className={`${inputClass} mt-2`}
          placeholder="Or paste image URL"
          value={form.image_url}
          onChange={(e) => update("image_url", e.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="touch-target w-full rounded-xl bg-brand-600 px-6 py-3.5 text-base font-semibold text-white hover:bg-brand-700 disabled:opacity-50 sm:w-auto"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

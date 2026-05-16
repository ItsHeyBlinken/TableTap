import { useState } from "react";
import type { CardFormData } from "../types";
import { apiUpload } from "../lib/api";

interface CardFormProps {
  initial: CardFormData;
  onSubmit: (data: CardFormData) => Promise<void>;
  submitLabel: string;
}

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
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

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
          <input required className={inputClass} value={form.player_name} onChange={(e) => update("player_name", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Year *</label>
          <input required type="number" className={inputClass} value={form.year} onChange={(e) => update("year", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Brand / set *</label>
          <input required className={inputClass} value={form.brand} onChange={(e) => update("brand", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Card number</label>
          <input className={inputClass} value={form.card_number} onChange={(e) => update("card_number", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Sport</label>
          <input className={inputClass} value={form.sport} onChange={(e) => update("sport", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Team</label>
          <input className={inputClass} value={form.team} onChange={(e) => update("team", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Condition</label>
          <input className={inputClass} value={form.condition} onChange={(e) => update("condition", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Cost basis (what you paid) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            className={inputClass}
            value={form.purchase_price}
            onChange={(e) => update("purchase_price", e.target.value)}
            placeholder="Used to calculate profit on sale"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Quantity</label>
          <input type="number" min="1" className={inputClass} value={form.quantity} onChange={(e) => update("quantity", e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="graded" checked={form.graded} onChange={(e) => update("graded", e.target.checked)} />
        <label htmlFor="graded" className="text-sm font-medium">
          Graded
        </label>
      </div>

      {form.graded && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Grading company</label>
            <input className={inputClass} value={form.grading_company} onChange={(e) => update("grading_company", e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Grade</label>
            <input className={inputClass} value={form.grade} onChange={(e) => update("grade", e.target.value)} />
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Notes</label>
        <textarea rows={3} className={inputClass} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
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
        className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { emptyCardForm, formToPayload } from "../lib/format";
import { CardForm } from "../components/CardForm";
import type { CardFormData } from "../types";

export function CardNewPage() {
  const navigate = useNavigate();

  const handleSubmit = async (form: CardFormData) => {
    await apiPost("/api/cards", formToPayload(form));
    navigate("/cards");
  };

  return (
    <div>
      <Link to="/cards" className="text-sm text-brand-600 hover:underline">
        ← Back to stock
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Add stock</h1>
      <div className="mt-6 max-w-3xl">
        <CardForm initial={emptyCardForm} onSubmit={handleSubmit} submitLabel="Add to stock" />
      </div>
    </div>
  );
}

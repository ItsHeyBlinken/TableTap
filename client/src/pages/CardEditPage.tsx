import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut } from "../lib/api";
import { cardToForm, formToPayload } from "../lib/format";
import { CardForm } from "../components/CardForm";
import type { Card, CardFormData } from "../types";

export function CardEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<CardFormData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    apiGet<{ card: Card }>(`/api/cards/${id}`)
      .then((data) => setInitial(cardToForm(data.card)))
      .catch((err) => setError(err instanceof Error ? err.message : "Card not found"));
  }, [id]);

  const handleSubmit = async (form: CardFormData) => {
    if (!id) return;
    await apiPut(`/api/cards/${id}`, formToPayload(form));
    navigate(`/cards/${id}`);
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!initial) return <p className="text-slate-600">Loading...</p>;

  return (
    <div>
      <Link to={`/cards/${id}`} className="text-sm text-brand-600 hover:underline">
        ← Back to card
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Edit card</h1>
      <div className="mt-6 max-w-3xl">
        <CardForm initial={initial} onSubmit={handleSubmit} submitLabel="Save changes" />
      </div>
    </div>
  );
}

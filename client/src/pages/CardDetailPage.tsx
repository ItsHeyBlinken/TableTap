import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiDelete, apiGet } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/format";
import type { Card } from "../types";
import { SellForm } from "../components/SellForm";

export function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState("");
  const [showSell, setShowSell] = useState(false);

  useEffect(() => {
    if (!id) return;
    apiGet<{ card: Card }>(`/api/cards/${id}`)
      .then((data) => setCard(data.card))
      .catch((err) => setError(err instanceof Error ? err.message : "Card not found"));
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm("Delete this item from stock?")) return;
    try {
      await apiDelete(`/api/cards/${id}`);
      navigate("/cards");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (error && !card) return <p className="text-red-600">{error}</p>;
  if (!card) return <p className="text-slate-600">Loading...</p>;

  return (
    <div>
      <Link to="/cards" className="text-sm text-brand-600 hover:underline">
        ← Back to stock
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          {card.image_url ? (
            <img src={card.image_url} alt={card.player_name} className="w-full rounded-xl object-cover" />
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              No image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">{card.player_name}</h1>
          <p className="mt-1 text-lg text-slate-600">
            {card.year} {card.brand}
            {card.card_number ? ` #${card.card_number}` : ""}
          </p>

          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-slate-500">Cost basis</dt>
              <dd className="font-medium">{formatCurrency(card.cost_basis)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium capitalize">{card.status === "sold" ? "Sold" : "In stock"}</dd>
            </div>
            {card.status === "sold" && (
              <>
                <div>
                  <dt className="text-slate-500">Sale price</dt>
                  <dd className="font-medium">{formatCurrency(card.sold_price)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Sale date</dt>
                  <dd className="font-medium">{formatDate(card.sold_date)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Profit</dt>
                  <dd className="font-semibold text-green-700">
                    {card.profit != null ? formatCurrency(card.profit) : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Event</dt>
                  <dd className="font-medium">{card.event_name ?? "—"}</dd>
                </div>
              </>
            )}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            {card.status === "active" && (
              <>
                <button
                  onClick={() => setShowSell(true)}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Record sale
                </button>
                <Link
                  to="/sell"
                  className="rounded-lg border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                >
                  Open POS
                </Link>
              </>
            )}
            <Link
              to={`/cards/${card.id}/edit`}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {showSell && card.status === "active" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Record sale</h2>
              <button type="button" onClick={() => setShowSell(false)} className="text-slate-500 hover:text-slate-800">
                ✕
              </button>
            </div>
            <SellForm
              card={card}
              onSuccess={(updated) => {
                setCard(updated);
                setShowSell(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

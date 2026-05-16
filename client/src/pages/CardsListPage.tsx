import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";
import { formatCurrency } from "../lib/format";
import type { Card, PaginationMeta } from "../types";
import { SearchFilters } from "../components/SearchFilters";
import { Pagination } from "../components/Pagination";

export function CardsListPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("");
  const [status, setStatus] = useState("active");
  const [graded, setGraded] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCards = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (sport) params.set("sport", sport);
    if (status) params.set("status", status);
    if (graded) params.set("graded", graded);
    try {
      const data = await apiGet<{ cards: Card[]; pagination: PaginationMeta }>(`/api/cards?${params}`);
      setCards(data.cards);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cards");
    } finally {
      setLoading(false);
    }
  }, [page, search, sport, status, graded]);

  useEffect(() => {
    const timer = setTimeout(loadCards, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadCards, search]);

  useEffect(() => {
    setPage(1);
  }, [search, sport, status, graded]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock on hand</h1>
          <p className="text-sm text-slate-600">Unsold inventory ready to sell at your table.</p>
        </div>
        <Link
          to="/cards/new"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          + Add stock
        </Link>
      </div>

      <SearchFilters
        search={search}
        sport={sport}
        status={status}
        graded={graded}
        onSearchChange={setSearch}
        onSportChange={setSport}
        onStatusChange={setStatus}
        onGradedChange={setGraded}
      />

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {loading ? (
        <p className="text-slate-600">Loading...</p>
      ) : cards.length === 0 ? (
        <p className="text-slate-600">No cards found.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">Player</th>
                <th className="px-4 py-3 font-medium">Year / Set</th>
                <th className="px-4 py-3 font-medium">Sport</th>
                <th className="px-4 py-3 font-medium">Cost basis</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link to={`/cards/${card.id}`} className="font-medium text-brand-600 hover:underline">
                      {card.player_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {card.year} {card.brand}
                  </td>
                  <td className="px-4 py-3">{card.sport ?? "—"}</td>
                  <td className="px-4 py-3">{formatCurrency(card.cost_basis)}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/sell?card=${card.id}`}
                      className="inline-block rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      Sell
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
    </div>
  );
}

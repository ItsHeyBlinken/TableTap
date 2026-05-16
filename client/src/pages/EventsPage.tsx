import { useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost } from "../lib/api";
import { formatDate } from "../lib/format";
import type { SalesEvent } from "../types";

export function EventsPage() {
  const [events, setEvents] = useState<SalesEvent[]>([]);
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => apiGet<{ events: SalesEvent[] }>("/api/events").then((d) => setEvents(d.events));

  useEffect(() => {
    load().catch(() => setError("Failed to load events"));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/events", {
        name,
        event_date: eventDate,
        description: description || null,
      });
      setName("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event? Sales keep their records but lose the event link.")) return;
    await apiDelete(`/api/events/${id}`);
    await load();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900">Sales events</h1>
      <p className="mt-1 text-slate-600">
        Card shows, table weekends, streams — group sales to see profit per event.
      </p>

      <form onSubmit={handleCreate} className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">New event</h2>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="mb-1 block text-sm font-medium">Event name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dallas Card Show Nov 2026"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Date *</label>
          <input
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add event"}
        </button>
      </form>

      <ul className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {events.length === 0 ? (
          <li className="px-4 py-6 text-center text-slate-600">No events yet.</li>
        ) : (
          events.map((ev) => (
            <li key={ev.id} className="flex items-center justify-between gap-4 px-4 py-4">
              <div>
                <p className="font-medium text-slate-900">{ev.name}</p>
                <p className="text-sm text-slate-500">{formatDate(ev.event_date)}</p>
                {ev.description && <p className="mt-1 text-sm text-slate-600">{ev.description}</p>}
              </div>
              <button
                onClick={() => handleDelete(ev.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

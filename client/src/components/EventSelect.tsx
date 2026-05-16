import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../lib/api";
import { getLastEventId, setLastEventId } from "../lib/posStorage";
import type { SalesEvent } from "../types";

interface EventSelectProps {
  value: string;
  onChange: (eventId: string) => void;
  required?: boolean;
  posMode?: boolean;
}

export function EventSelect({ value, onChange, required, posMode }: EventSelectProps) {
  const [events, setEvents] = useState<SalesEvent[]>([]);

  useEffect(() => {
    apiGet<{ events: SalesEvent[] }>("/api/events")
      .then((data) => {
        setEvents(data.events);
        if (posMode && !value) {
          const last = getLastEventId();
          if (last && data.events.some((e) => e.id === last)) {
            onChange(last);
          } else if (data.events[0]) {
            onChange(data.events[0].id);
          }
        }
      })
      .catch(() => setEvents([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once
  }, []);

  const handleChange = (id: string) => {
    onChange(id);
    if (posMode) setLastEventId(id);
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {posMode ? "Show / event" : `Sales event ${required ? "*" : "(optional)"}`}
      </label>
      <select
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        required={required}
        className={`w-full rounded-lg border border-slate-300 bg-white ${
          posMode ? "px-4 py-3 text-base" : "px-3 py-2.5 text-sm"
        }`}
      >
        <option value="">Walk-up (no event)</option>
        {events.map((ev) => (
          <option key={ev.id} value={ev.id}>
            {ev.name}
          </option>
        ))}
      </select>
      {!posMode && (
        <p className="mt-1 text-xs text-slate-500">
          <Link to="/events" className="text-brand-600 hover:underline">
            Manage events
          </Link>
        </p>
      )}
    </div>
  );
}

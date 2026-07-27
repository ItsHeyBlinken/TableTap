import type { FaqBlock, FaqItem } from "../content/faq";
import { VENDOR_FAQ } from "../content/faq";
import { APP_DISPLAY_NAME } from "../lib/brand";

function FaqBlockView({ block }: { block: FaqBlock }) {
  switch (block.type) {
    case "p":
      return <p className="text-slate-600">{block.text}</p>;
    case "ul":
      return (
        <ul className="list-disc space-y-1 pl-5 text-slate-600">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-1 pl-5 text-slate-600">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                {block.headers.map((h) => (
                  <th key={h} className="px-3 py-2 font-medium text-slate-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row.join()} className="border-t border-slate-100">
                  {row.map((cell, i) => (
                    <td key={i} className="px-3 py-2 text-slate-600">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function FaqAccordionItem({ item }: { item: FaqItem }) {
  return (
    <details className="group border-b border-slate-200 last:border-b-0">
      <summary className="cursor-pointer list-none py-4 pr-8 text-base font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="flex items-start justify-between gap-3">
          {item.question}
          <span
            className="mt-0.5 shrink-0 text-brand-600 transition-transform group-open:rotate-45"
            aria-hidden
          >
            +
          </span>
        </span>
      </summary>
      <div className="space-y-3 pb-5 text-sm leading-relaxed">
        {item.blocks.map((block, i) => (
          <FaqBlockView key={i} block={block} />
        ))}
      </div>
    </details>
  );
}

interface FaqSectionProps {
  /** When true, omit outer section chrome (for embedding in another page). */
  embedded?: boolean;
  className?: string;
}

export function FaqSection({ embedded, className = "" }: FaqSectionProps) {
  const inner = (
    <>
      <h2 className="text-center text-3xl font-bold text-slate-900">Vendor FAQ</h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">
        Common questions before you sign up — payments, profit tracking, trades, and what{" "}
        {APP_DISPLAY_NAME} is (and isn&apos;t).
      </p>
      <div className="mx-auto mt-10 max-w-3xl rounded-xl border border-slate-200 bg-white px-4 sm:px-6">
        {VENDOR_FAQ.map((item) => (
          <FaqAccordionItem key={item.id} item={item} />
        ))}
      </div>
    </>
  );

  if (embedded) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <section id="faq" className={`scroll-mt-20 border-t border-slate-200 bg-slate-50 py-16 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{inner}</div>
    </section>
  );
}

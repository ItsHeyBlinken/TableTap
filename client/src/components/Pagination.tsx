interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="touch-target rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-sm text-slate-600">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="touch-target rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

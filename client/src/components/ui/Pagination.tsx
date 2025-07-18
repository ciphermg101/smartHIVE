interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex justify-center items-center gap-2 mt-4" aria-label="Pagination">
      <button
        className="px-2 py-1 rounded border focus:ring-2 focus:ring-primary disabled:opacity-50"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        &lt;
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          className={`px-3 py-1 rounded border focus:ring-2 focus:ring-primary ${p === page ? 'bg-primary text-white' : ''}`}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}
      <button
        className="px-2 py-1 rounded border focus:ring-2 focus:ring-primary disabled:opacity-50"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
      >
        &gt;
      </button>
    </nav>
  );
} 
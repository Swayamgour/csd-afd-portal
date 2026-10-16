import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination-nav" aria-label="Table pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="pagination-btn icon-btn"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="pagination-pages">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          // Show first, last, current, and neighbours
          if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
            return (
              <button
                key={p}
                type="button"
                className={`pagination-page ${page === p ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
                aria-current={page === p ? 'page' : undefined}
              >
                {p}
              </button>
            );
          }
          if (p === 2 && page > 3) {
            return <span key="ellipsis-start" className="pagination-dots">…</span>;
          }
          if (p === totalPages - 1 && page < totalPages - 2) {
            return <span key="ellipsis-end" className="pagination-dots">…</span>;
          }
          return null;
        })}
      </div>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="pagination-btn icon-btn"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}

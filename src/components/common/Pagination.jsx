import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, 'ellipsis-start', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', totalPages];
}

export default function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav className="pagination-nav" aria-label="Table pagination">
      {/* First Page */}
      {totalPages > 4 && (
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          className="pagination-btn icon-btn"
          title="First page"
          aria-label="First page"
        >
          <ChevronsLeft size={15} />
        </button>
      )}

      {/* Previous Page */}
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="pagination-btn icon-btn"
        title="Previous page"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      <div className="pagination-pages">
        {pageNumbers.map((p, idx) => {
          if (typeof p === 'string' && p.startsWith('ellipsis')) {
            return (
              <span key={`dots-${idx}`} className="pagination-dots" aria-hidden="true">
                …
              </span>
            );
          }
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
        })}
      </div>

      {/* Next Page */}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="pagination-btn icon-btn"
        title="Next page"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>

      {/* Last Page */}
      {totalPages > 4 && (
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          className="pagination-btn icon-btn"
          title="Last page"
          aria-label="Last page"
        >
          <ChevronsRight size={15} />
        </button>
      )}
    </nav>
  );
}

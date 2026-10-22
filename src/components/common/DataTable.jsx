import React from 'react';
import { Loader2, SearchX } from 'lucide-react';
import Pagination from './Pagination.jsx';

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyText = 'There are no items to display matching the criteria.',
  pagination, // { page, totalPages, totalItems, onPageChange, pageSize }
  onRowClick,
  className = ''
}) {
  return (
    <div className={`data-table-container ${className}`}>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.className || ''} width={col.width || undefined}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="table-state-cell">
                  <div className="table-loader">
                    <Loader2 className="spin" size={24} aria-hidden="true" />
                    <span>Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-state-cell">
                  <div className="table-empty">
                    <SearchX size={32} className="text-muted" aria-hidden="true" />
                    <h4>{emptyTitle}</h4>
                    <p className="muted small">{emptyText}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={row.id || rIdx}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? 'clickable-row' : ''}
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className={col.className || ''}>
                      {col.render ? col.render(row, rIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="table-pagination-footer between">
          <span className="small muted">
            Showing Page <b>{pagination.page}</b> of <b>{pagination.totalPages}</b> ({pagination.totalItems || data.length} total records)
          </span>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;

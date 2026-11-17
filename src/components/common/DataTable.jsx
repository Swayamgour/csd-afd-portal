import React from 'react';
import { Loader2, SearchX } from 'lucide-react';
import Pagination from './Pagination.jsx';

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyText = 'There are no items to display matching the criteria.',
  pagination, // { page, totalPages, pages, totalItems, total, onPageChange, pageSize, onPageSizeChange }
  onRowClick,
  className = ''
}) {
  const currentPage = Number(pagination?.page) || 1;
  const pageSize = Number(pagination?.pageSize) || 15;
  const totalItems = Number(pagination?.totalItems ?? pagination?.total ?? data.length) || 0;
  const totalPages =
    Number(pagination?.totalPages || pagination?.pages) ||
    (totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

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
                  key={row.id || row._id || rIdx}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? 'clickable-row' : ''}
                >
                  {columns.map((col, cIdx) => (
                    <td key={col.accessor || col.id || col.header || cIdx} className={col.className || ''}>
                      {col.render ? col.render(row, rIdx) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="table-pagination-footer between">
          <div className="flex items-center gap-3">
            <span className="small muted">
              Showing <b>{startItem}</b>–<b>{endItem}</b> of <b>{totalItems}</b> records
              {totalPages > 1 && (
                <> (Page <b>{currentPage}</b> of <b>{totalPages}</b>)</>
              )}
            </span>
            {pagination.onPageSizeChange && (
              <div className="flex items-center gap-1.5 small muted text-xs">
                <span>Per page:</span>
                <select
                  className="form-control text-xs py-0.5 px-2 h-7 w-20 rounded border-slate-300"
                  value={pageSize}
                  onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                >
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            )}
          </div>
          {totalPages > 1 ? (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={pagination.onPageChange}
            />
          ) : (
            <span className="small muted text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
              Page 1 of 1
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;

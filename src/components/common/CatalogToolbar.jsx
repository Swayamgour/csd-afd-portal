import React from 'react';
import { Filter, RefreshCw, LayoutGrid, List } from 'lucide-react';
import SearchInput from './SearchInput.jsx';

/**
 * Shared toolbar for every product catalogue page
 * (Beneficiary, URC, Depot, OEM): search + category filter + refresh (+ optional view toggle).
 */
export function CatalogToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search by model, brand, or SKU...',
  category,
  onCategoryChange,
  categories = [],
  allLabel = 'All Categories',
  showCategoryCode = false,
  onRefresh,
  refreshing = false,
  view,
  onViewChange,
  getCategoryValue = (c) => c._id || c.code,
  filterIcon: FilterIcon = Filter
}) {
  return (
    <div className="catalog-toolbar">
      <SearchInput
        className="catalog-toolbar-search"
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
      />

      <div className="catalog-toolbar-filters">
        <label className="catalog-select">
          <FilterIcon size={16} className="catalog-select-icon" aria-hidden="true" />
          <select
            className="form-control"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">{allLabel}</option>
            {categories.map((c) => (
              <option key={c._id || c.code} value={getCategoryValue(c)}>
                {c.name}
                {showCategoryCode && c.code ? ` (${c.code})` : ''}
              </option>
            ))}
          </select>
        </label>

        {onRefresh && (
          <button
            type="button"
            className="btn out icon-only"
            onClick={onRefresh}
            title="Refresh catalogue"
            aria-label="Refresh catalogue"
            disabled={refreshing}
          >
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} aria-hidden="true" />
          </button>
        )}

        {onViewChange && (
          <div className="catalog-view-toggle" role="group" aria-label="Catalogue view">
            <button
              type="button"
              className={view === 'table' ? 'active' : ''}
              onClick={() => onViewChange('table')}
              aria-pressed={view === 'table'}
              title="Table view"
            >
              <List size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={view === 'grid' ? 'active' : ''}
              onClick={() => onViewChange('grid')}
              aria-pressed={view === 'grid'}
              title="Card view"
            >
              <LayoutGrid size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CatalogToolbar;

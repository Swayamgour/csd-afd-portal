import { useMemo } from 'react';
import { useGetProductsQuery } from '../features/catalog/productApi.js';
import { mapBackendProduct } from '../data/api.js';

/**
 * Single source of truth for the public storefront product list.
 *
 * Every component (Home, Catalog, SearchBox, Cart, Compare, ProductDetails ...)
 * calls this hook with the SAME query args, so RTK Query sends exactly ONE
 * GET /products?limit=100 and shares the cached result everywhere
 * (even when React.StrictMode double-mounts components in dev).
 */
export const STORE_QUERY = { limit: 100 };

export function useStoreProducts(options = {}) {
  const { data, isLoading, isFetching, isError, refetch } = useGetProductsQuery(STORE_QUERY, options);

  const products = useMemo(
    () => (data?.items || []).map(mapBackendProduct).filter(Boolean),
    [data],
  );

  return {
    products,
    isLoading,                       // first load, nothing to show yet
    isFetching,                      // any in-flight request (incl. background)
    isError: isError && !products.length,
    isEmpty: !isLoading && !isError && products.length === 0,
    refetch,
  };
}

export default useStoreProducts;

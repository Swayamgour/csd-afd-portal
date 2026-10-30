import { api } from '../../redux/api';

const extractArray = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response)) return response;
  return [];
};

export const orgApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDealers: builder.query({
      query: (params = {}) => ({
        url: '/dealers',
        params,
      }),
      transformResponse: extractArray,
      providesTags: ['Dealer'],
    }),

    getDealerById: builder.query({
      query: (id) => `/dealers/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Dealer'],
    }),

    getDepots: builder.query({
      query: (params = {}) => ({
        url: '/depots',
        params,
      }),
      transformResponse: extractArray,
      providesTags: ['Depot'],
    }),

    getDepotById: builder.query({
      query: (id) => `/depots/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Depot'],
    }),

    getUrcs: builder.query({
      query: (params = {}) => ({
        url: '/urcs',
        params,
      }),
      transformResponse: extractArray,
      providesTags: ['Urc'],
    }),

    getUrcById: builder.query({
      query: (id) => `/urcs/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Urc'],
    }),

    getOems: builder.query({
      query: (params = {}) => ({
        url: '/oems',
        params,
      }),
      transformResponse: extractArray,
      providesTags: ['Oem'],
    }),

    getOemById: builder.query({
      query: (id) => `/oems/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Oem'],
    }),

    createOem: builder.mutation({
      query: (body) => ({
        url: '/oems',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Oem', 'Dashboard'],
    }),

    updateOem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/oems/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Oem', 'Dashboard'],
    }),

    createDealer: builder.mutation({
      query: (body) => ({
        url: '/dealers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dealer', 'Dashboard'],
    }),

    updateDealer: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/dealers/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Dealer', 'Dashboard'],
    }),

    createDepot: builder.mutation({
      query: (body) => ({
        url: '/depots',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Depot', 'Dashboard'],
    }),

    updateDepot: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/depots/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Depot', 'Dashboard'],
    }),

    createUrc: builder.mutation({
      query: (body) => ({
        url: '/urcs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Urc', 'Dashboard'],
    }),

    updateUrc: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/urcs/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Urc', 'Dashboard'],
    }),

    /* ---------- org accounts: org + login user in one call (backend /org-accounts) ---------- */
    getOrgMeta: builder.query({
      query: (params = {}) => ({ url: '/org-accounts/meta', params }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['State', 'Depot', 'Oem', 'Category', 'PriceZone'],
    }),

    createOrgAccount: builder.mutation({
      // body.role = DEPOT_OFFICIAL | URC | DEALER
      query: (body) => ({ url: '/org-accounts', method: 'POST', body }),
      invalidatesTags: ['Dealer', 'Depot', 'Urc', 'User', 'State', 'Dashboard'],
    }),

    getOrgDealer: builder.query({
      query: (id) => `/org-accounts/dealers/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Dealer'],
    }),

    updateDealerAccount: builder.mutation({
      // name, code, oemId, depotId  (category OEM se, state depot se - server side)
      query: ({ id, ...body }) => ({ url: `/org-accounts/dealers/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Dealer', 'DealerProduct', 'Depot'],
    }),

    getPriceZones: builder.query({
      query: (params = {}) => ({
        url: '/price-zones',
        params,
      }),
      transformResponse: extractArray,
      providesTags: ['PriceZone'],
    }),

    getPriceZoneById: builder.query({
      query: (id) => `/price-zones/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['PriceZone'],
    }),

    getDealerProducts: builder.query({
      query: (params = {}) => ({
        url: '/dealer-products',
        params,
      }),
      transformResponse: extractArray,
      providesTags: ['DealerProduct'],
    }),

    createDealerProduct: builder.mutation({
      query: (body) => ({
        url: '/dealer-products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['DealerProduct', 'Dealer', 'Product'],
    }),

    updateDealerProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/dealer-products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['DealerProduct', 'Dealer', 'Product'],
    }),

    deleteDealerProduct: builder.mutation({
      query: (id) => ({
        url: `/dealer-products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DealerProduct', 'Dealer', 'Product'],
    }),

    getAvailableStates: builder.query({
      query: (params = {}) => ({
        url: '/states',
        params,
      }),
      transformResponse: extractArray,
      providesTags: ['State'],
    }),

    getStateDealers: builder.query({
      query: ({ state, productId }) => ({
        url: `/states/${encodeURIComponent(state)}/dealers`,
        params: productId ? { productId } : {},
      }),
      transformResponse: extractArray,
      providesTags: ['Dealer'],
    }),

    getStateDepots: builder.query({
      query: ({ state, dealerId, productId }) => {
        const params = {};
        if (dealerId) params.dealerId = dealerId;
        if (productId) params.productId = productId;
        return {
          url: `/states/${encodeURIComponent(state)}/depots`,
          params,
        };
      },
      transformResponse: extractArray,
      providesTags: ['Depot'],
    }),

    getDepotUrcs: builder.query({
      query: ({ state, depotId }) => ({
        url: `/states/${encodeURIComponent(state)}/depots/${depotId}/urcs`,
      }),
      transformResponse: extractArray,
      providesTags: ['Urc'],
    }),

    getStateProductPrice: builder.query({
      query: ({ state, productId, quantity = 1 }) => ({
        url: `/states/${encodeURIComponent(state)}/price`,
        params: { productId, quantity },
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['ProductPrice'],
    }),
  }),
});

export const {
  useGetDealersQuery,
  useGetDealerByIdQuery,
  useCreateDealerMutation,
  useUpdateDealerMutation,
  useGetDepotsQuery,
  useGetDepotByIdQuery,
  useCreateDepotMutation,
  useUpdateDepotMutation,
  useGetUrcsQuery,
  useGetUrcByIdQuery,
  useCreateUrcMutation,
  useUpdateUrcMutation,
  useGetOemsQuery,
  useGetOemByIdQuery,
  useCreateOemMutation,
  useUpdateOemMutation,
  useGetPriceZonesQuery,
  useGetOrgMetaQuery,
  useCreateOrgAccountMutation,
  useGetOrgDealerQuery,
  useUpdateDealerAccountMutation,
  useGetPriceZoneByIdQuery,
  useGetDealerProductsQuery,
  useCreateDealerProductMutation,
  useUpdateDealerProductMutation,
  useDeleteDealerProductMutation,
  useGetAvailableStatesQuery,
  useGetStateDealersQuery,
  useGetStateDepotsQuery,
  useGetDepotUrcsQuery,
  useGetStateProductPriceQuery,
} = orgApi;



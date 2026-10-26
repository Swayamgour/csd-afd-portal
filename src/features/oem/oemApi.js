import { api } from '../../redux/api';

export const oemApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // 1. Dashboard & Analytics
    getOemDashboard: builder.query({
      query: () => '/oem/dashboard',
      transformResponse: (response) => response?.data || response,
      providesTags: ['OemDashboard'],
    }),

    getOemSummary: builder.query({
      query: () => '/oem/dashboard/summary',
      transformResponse: (response) => response?.data || response,
      providesTags: ['OemDashboard'],
    }),

    // 2. Product Catalog
    getOemProducts: builder.query({
      query: (params = {}) => ({
        url: '/oem/products',
        params,
      }),
      transformResponse: (response) => {
        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.items)
          ? response.data.items
          : Array.isArray(response?.items)
          ? response.items
          : [];
        const meta = response?.meta || {};
        return { items, meta };
      },
      providesTags: (result) =>
        result?.items && Array.isArray(result.items)
          ? [
              ...result.items.map(({ _id, id }) => ({ type: 'OemProduct', id: _id || id })),
              { type: 'OemProduct', id: 'LIST' },
              'OemProduct',
            ]
          : [{ type: 'OemProduct', id: 'LIST' }, 'OemProduct'],
    }),

    getOemProductById: builder.query({
      query: (id) => `/oem/products/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (_res, _err, id) => [{ type: 'OemProduct', id }, 'OemProduct'],
    }),

    createOemProduct: builder.mutation({
      query: (body) => ({
        url: '/oem/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OemProduct', 'OemDashboard', 'Product'],
    }),

    updateOemProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/oem/products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'OemProduct', id },
        'OemProduct',
        'OemDashboard',
        'Product',
      ],
    }),

    updateOemProductStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/oem/products/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'OemProduct', id },
        'OemProduct',
        'OemDashboard',
        'Product',
      ],
    }),

    // 3. Dealer Network
    getOemDealers: builder.query({
      query: (params = {}) => ({
        url: '/oem/dealers',
        params,
      }),
      transformResponse: (response) => {
        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.items)
          ? response.data.items
          : Array.isArray(response?.items)
          ? response.items
          : [];
        const meta = response?.meta || {};
        return { items, meta };
      },
      providesTags: (result) =>
        result?.items && Array.isArray(result.items)
          ? [
              ...result.items.map(({ _id, id }) => ({ type: 'OemDealer', id: _id || id })),
              { type: 'OemDealer', id: 'LIST' },
              'OemDealer',
            ]
          : [{ type: 'OemDealer', id: 'LIST' }, 'OemDealer'],
    }),

    getOemDealerById: builder.query({
      query: (id) => `/oem/dealers/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (_res, _err, id) => [{ type: 'OemDealer', id }, 'OemDealer'],
    }),

    getOemDealerProducts: builder.query({
      query: (dealerId) => `/oem/dealers/${dealerId}/products`,
      transformResponse: (response) => response?.data || response || [],
      providesTags: ['OemDealerProduct'],
    }),

    getOemDealerAppointments: builder.query({
      query: (dealerId) => `/oem/dealers/${dealerId}/appointments`,
      transformResponse: (response) => response?.data || response || [],
      providesTags: ['OemDealer'],
    }),

    // 4. Dealer Product Mappings
    getOemDealerProductsList: builder.query({
      query: (params = {}) => ({
        url: '/oem/dealer-products',
        params,
      }),
      transformResponse: (response) => {
        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.items)
          ? response.data.items
          : Array.isArray(response?.items)
          ? response.items
          : [];
        const meta = response?.meta || {};
        return { items, meta };
      },
      providesTags: (result) =>
        result?.items && Array.isArray(result.items)
          ? [
              ...result.items.map(({ _id, id }) => ({ type: 'OemDealerProduct', id: _id || id })),
              { type: 'OemDealerProduct', id: 'LIST' },
              'OemDealerProduct',
            ]
          : [{ type: 'OemDealerProduct', id: 'LIST' }, 'OemDealerProduct'],
    }),

    createOemDealerProduct: builder.mutation({
      query: (body) => ({
        url: '/oem/dealer-products',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OemDealerProduct', 'OemDealer', 'OemDashboard'],
    }),

    updateOemDealerProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/oem/dealer-products/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'OemDealerProduct', id },
        'OemDealerProduct',
        'OemDealer',
      ],
    }),

    deleteOemDealerProduct: builder.mutation({
      query: (id) => ({
        url: `/oem/dealer-products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'OemDealerProduct', id },
        'OemDealerProduct',
        'OemDealer',
        'OemDashboard',
      ],
    }),

    // 5. State-Wise Pricing
    getOemPricing: builder.query({
      query: (params = {}) => ({
        url: '/oem/pricing',
        params,
      }),
      transformResponse: (response) => {
        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.items)
          ? response.data.items
          : Array.isArray(response?.items)
          ? response.items
          : [];
        const meta = response?.meta || {};
        return { items, meta };
      },
      providesTags: (result) =>
        result?.items && Array.isArray(result.items)
          ? [
              ...result.items.map(({ _id, id }) => ({ type: 'OemPricing', id: _id || id })),
              { type: 'OemPricing', id: 'LIST' },
              'OemPricing',
            ]
          : [{ type: 'OemPricing', id: 'LIST' }, 'OemPricing'],
    }),

    getOemPricingById: builder.query({
      query: (id) => `/oem/pricing/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (_res, _err, id) => [{ type: 'OemPricing', id }, 'OemPricing'],
    }),

    createOemPricing: builder.mutation({
      query: (body) => ({
        url: '/oem/pricing',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['OemPricing'],
    }),

    updateOemPricing: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/oem/pricing/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'OemPricing', id },
        'OemPricing',
      ],
    }),

    // 6. Demands
    getOemDemands: builder.query({
      query: (params = {}) => ({
        url: '/oem/demands',
        params,
      }),
      transformResponse: (response) => {
        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.items)
          ? response.data.items
          : Array.isArray(response?.items)
          ? response.items
          : [];
        const meta = response?.meta || {};
        return { items, meta };
      },
      providesTags: (result) =>
        result?.items && Array.isArray(result.items)
          ? [
              ...result.items.map(({ _id, id }) => ({ type: 'OemDemand', id: _id || id })),
              { type: 'OemDemand', id: 'LIST' },
              'OemDemand',
            ]
          : [{ type: 'OemDemand', id: 'LIST' }, 'OemDemand'],
    }),

    getOemDemandById: builder.query({
      query: (id) => `/oem/demands/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (_res, _err, id) => [{ type: 'OemDemand', id }, 'OemDemand'],
    }),

    // 7. Orders
    getOemOrders: builder.query({
      query: (params = {}) => ({
        url: '/oem/orders',
        params,
      }),
      transformResponse: (response) => {
        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.items)
          ? response.data.items
          : Array.isArray(response?.items)
          ? response.items
          : [];
        const meta = response?.meta || {};
        return { items, meta };
      },
      providesTags: (result) =>
        result?.items && Array.isArray(result.items)
          ? [
              ...result.items.map(({ _id, id }) => ({ type: 'OemOrder', id: _id || id })),
              { type: 'OemOrder', id: 'LIST' },
              'OemOrder',
            ]
          : [{ type: 'OemOrder', id: 'LIST' }, 'OemOrder'],
    }),

    getOemOrderById: builder.query({
      query: (id) => `/oem/orders/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (_res, _err, id) => [{ type: 'OemOrder', id }, 'OemOrder'],
    }),

    updateOemOrderStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/oem/orders/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'OemOrder', id },
        'OemOrder',
        'OemDemand',
        'OemDashboard',
        'Order',
        'Demand',
      ],
    }),

    // 8. Reports
    getOemProductsReport: builder.query({
      query: () => '/oem/reports/products',
      transformResponse: (response) => response?.data || response,
      providesTags: ['OemReport'],
    }),

    getOemDealersReport: builder.query({
      query: () => '/oem/reports/dealers',
      transformResponse: (response) => response?.data || response,
      providesTags: ['OemReport'],
    }),

    getOemDemandsReport: builder.query({
      query: (params = {}) => ({
        url: '/oem/reports/demands',
        params,
      }),
      transformResponse: (response) => {
        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.items)
          ? response.data.items
          : Array.isArray(response?.items)
          ? response.items
          : [];
        const meta = response?.meta || {};
        return { items, meta };
      },
      providesTags: ['OemReport'],
    }),

    getOemOrdersReport: builder.query({
      query: (params = {}) => ({
        url: '/oem/reports/orders',
        params,
      }),
      transformResponse: (response) => {
        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.items)
          ? response.data.items
          : Array.isArray(response?.items)
          ? response.items
          : [];
        const meta = response?.meta || {};
        return { items, meta };
      },
      providesTags: ['OemReport'],
    }),

    // 9. Profile
    getOemProfile: builder.query({
      query: () => '/oem/profile',
      transformResponse: (response) => response?.data || response,
      providesTags: ['OemProfile'],
    }),

    updateOemProfile: builder.mutation({
      query: (body) => ({
        url: '/oem/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['OemProfile'],
    }),
  }),
});

export const {
  useGetOemDashboardQuery,
  useGetOemSummaryQuery,
  useGetOemProductsQuery,
  useGetOemProductByIdQuery,
  useCreateOemProductMutation,
  useUpdateOemProductMutation,
  useUpdateOemProductStatusMutation,
  useGetOemDealersQuery,
  useGetOemDealerByIdQuery,
  useGetOemDealerProductsQuery,
  useGetOemDealerAppointmentsQuery,
  useGetOemDealerProductsListQuery,
  useCreateOemDealerProductMutation,
  useUpdateOemDealerProductMutation,
  useDeleteOemDealerProductMutation,
  useGetOemPricingQuery,
  useGetOemPricingByIdQuery,
  useCreateOemPricingMutation,
  useUpdateOemPricingMutation,
  useGetOemDemandsQuery,
  useGetOemDemandByIdQuery,
  useGetOemOrdersQuery,
  useGetOemOrderByIdQuery,
  useUpdateOemOrderStatusMutation,
  useGetOemProductsReportQuery,
  useGetOemDealersReportQuery,
  useGetOemDemandsReportQuery,
  useGetOemOrdersReportQuery,
  useGetOemProfileQuery,
  useUpdateOemProfileMutation,
} = oemApi;

import { api } from '../../redux/api';

export const demandApi = api.injectEndpoints({
  endpoints: (builder) => ({
    checkDemandEligibility: builder.mutation({
      query: (body) => ({
        url: '/demands/check-eligibility',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data || response,
    }),

    createDemand: builder.mutation({
      query: (body) => ({
        url: '/demands',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Demand', 'Dashboard', 'Product', 'Order'],
    }),

    getDemands: builder.query({
      query: (params = {}) => ({
        url: '/demands',
        params,
      }),
      transformResponse: (response) => {
        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.items)
          ? response.data.items
          : Array.isArray(response)
          ? response
          : [];
        const meta = response?.meta || {};
        return { items, meta };
      },
      providesTags: (result) =>
        result?.items && Array.isArray(result.items)
          ? [
              ...result.items.map(({ _id, id }) => ({ type: 'Demand', id: _id || id })),
              { type: 'Demand', id: 'LIST' },
              'Demand',
            ]
          : [{ type: 'Demand', id: 'LIST' }, 'Demand'],
    }),

    getDemandById: builder.query({
      query: (id) => `/demands/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (_result, _error, id) => [{ type: 'Demand', id }, 'Demand'],
    }),

    cancelDemand: builder.mutation({
      query: ({ id, reason = 'Cancelled by beneficiary' }) => ({
        url: `/demands/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Demand', 'Dashboard', 'Order'],
    }),

    getOrders: builder.query({
      query: (params = {}) => ({
        url: '/orders',
        params,
      }),
      transformResponse: (response) => {
        const items = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.items)
          ? response.data.items
          : Array.isArray(response)
          ? response
          : [];
        const meta = response?.meta || {};
        return { items, meta };
      },
      providesTags: ['Order'],
    }),

    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }, 'Order'],
    }),

    dealerVerifyDemand: builder.mutation({
      query: ({ id, status, remarks, chassisNo, engineNo, estimatedDeliveryDays }) => ({
        url: `/demands/${id}/dealer-verify`,
        method: 'PATCH',
        body: { status, remarks, chassisNo, engineNo, estimatedDeliveryDays },
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Demand', 'Dashboard', 'Order'],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, status, note, delivery }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { status, note, ...delivery },
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Order', 'Dashboard', 'Demand'],
    }),

    approveDemand: builder.mutation({
      query: ({ id, remarks, note }) => ({
        url: `/demands/${id}/approve`,
        method: 'PATCH',
        body: { note: note || remarks, remarks: remarks || note },
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Demand', 'Dashboard', 'Order'],
    }),

    rejectDemand: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/demands/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Demand', 'Dashboard', 'Order'],
    }),

    recordPaymentDetails: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/demands/${id}/payment-details`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Demand', 'Dashboard', 'Order'],
    }),

    uploadSupplyOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/demands/${id}/supply-order`,
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Demand', 'Dashboard', 'Order'],
    }),

    // Depot Order Import: items = [{ demandId, officialReceiptUrl, supplyOrderUrl, authorityLetterUrl }] (max 100)
    // -> { total, imported, failed, results: [{ demandId, demandNo, ok, code?, message? }] }
    bulkUploadSupplyOrders: builder.mutation({
      query: (items) => ({ url: '/demands/bulk/supply-order', method: 'POST', body: { items } }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Demand', 'Dashboard', 'Order'],
    }),

    getDemandSummary: builder.query({
      query: (id) => `/demands/${id}/summary`,
      transformResponse: (response) => response?.data || response,
      providesTags: (_r, _e, id) => [{ type: 'Demand', id }, 'Demand'],
    }),

    getDemandNotes: builder.query({
      query: (id) => `/demands/${id}/notes`,
      transformResponse: (response) => {
        const d = response?.data ?? response;
        return Array.isArray(d) ? d : d?.items || [];
      },
      providesTags: (_r, _e, id) => [{ type: 'DemandNotes', id }],
    }),

    addDemandNote: builder.mutation({
      query: ({ id, text }) => ({
        url: `/demands/${id}/notes`,
        method: 'POST',
        body: { text },
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: (_r, _e, { id }) => [{ type: 'DemandNotes', id }],
    }),
  }),
});

export const {
  useUploadSupplyOrderMutation,
  useBulkUploadSupplyOrdersMutation,
  useGetDemandSummaryQuery,
  useGetDemandNotesQuery,
  useAddDemandNoteMutation,
  useCheckDemandEligibilityMutation,
  useCreateDemandMutation,
  useGetDemandsQuery,
  useGetDemandByIdQuery,
  useCancelDemandMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useDealerVerifyDemandMutation,
  useUpdateOrderStatusMutation,
  useApproveDemandMutation,
  useRejectDemandMutation,
  useRecordPaymentDetailsMutation,
} = demandApi;

import { api } from '../baseApi';

const unwrap = (r) => r?.data ?? r;
const listOf = (r) => ({
  items: Array.isArray(r?.data) ? r.data : Array.isArray(r?.data?.items) ? r.data.items : [],
  meta: r?.meta || {},
});

/**
 * Product approvals for CSD HO / Admin
 *  - NEW product added by an OEM            -> approve = product goes live
 *  - price / image UPDATE of a live product -> approve = change applied
 */
export const productApprovalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductApprovals: builder.query({
      query: (params = {}) => ({ url: '/product-approvals', params }),
      transformResponse: listOf,
      providesTags: ['Product'],
    }),

    getProductApprovalSummary: builder.query({
      query: () => '/product-approvals/summary',
      transformResponse: unwrap,
      providesTags: ['Product'],
    }),

    approveProduct: builder.mutation({
      query: ({ id, remarks }) => ({ url: `/product-approvals/${id}/approve`, method: 'POST', body: { remarks } }),
      invalidatesTags: ['Product', 'OemProduct', 'OemPricing', 'OemDashboard'],
    }),

    approveProductsMany: builder.mutation({
      query: ({ ids, remarks }) => ({ url: '/product-approvals/approve-many', method: 'POST', body: { ids, remarks } }),
      transformResponse: unwrap,
      invalidatesTags: ['Product', 'OemProduct', 'OemPricing', 'OemDashboard'],
    }),

    rejectProduct: builder.mutation({
      query: ({ id, reason }) => ({ url: `/product-approvals/${id}/reject`, method: 'POST', body: { reason } }),
      invalidatesTags: ['Product', 'OemProduct', 'OemDashboard'],
    }),
  }),
});

export const {
  useGetProductApprovalsQuery,
  useGetProductApprovalSummaryQuery,
  useApproveProductMutation,
  useApproveProductsManyMutation,
  useRejectProductMutation,
} = productApprovalApi;

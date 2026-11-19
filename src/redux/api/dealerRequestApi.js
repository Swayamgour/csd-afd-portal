import { api } from '../baseApi';

const unwrap = (r) => r?.data ?? r;
const listOf = (r) => ({
  items: Array.isArray(r?.data) ? r.data : Array.isArray(r?.data?.items) ? r.data.items : [],
  meta: r?.meta || {},
});

/**
 * New-dealer onboarding workflow (backend: /api/v1/dealer-requests)
 * OEM raises -> Admin forwards to depot -> Depot forwards to URC -> URC verifies (location + photos) -> Admin creates dealer
 */
export const dealerRequestApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDealerRequests: builder.query({
      query: (params = {}) => ({ url: '/dealer-requests', params }),
      transformResponse: listOf,
      providesTags: (res) => [
        ...(res?.items || []).map((r) => ({ type: 'DealerRequest', id: r._id })),
        { type: 'DealerRequest', id: 'LIST' },
      ],
    }),
    getDealerRequestById: builder.query({
      query: (id) => `/dealer-requests/${id}`,
      transformResponse: unwrap,
      providesTags: (_r, _e, id) => [{ type: 'DealerRequest', id }],
    }),
    getDealerRequestSummary: builder.query({
      query: () => '/dealer-requests/summary',
      transformResponse: unwrap,
      providesTags: [{ type: 'DealerRequest', id: 'LIST' }],
    }),
    getMyUrcsForDealerRequests: builder.query({
      query: () => '/dealer-requests/meta/my-urcs',
      transformResponse: (r) => (Array.isArray(r?.data) ? r.data : []),
    }),

    createDealerRequest: builder.mutation({
      query: (body) => ({ url: '/dealer-requests', method: 'POST', body }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: 'DealerRequest', id: 'LIST' }],
    }),
    cancelDealerRequest: builder.mutation({
      query: ({ id, reason }) => ({ url: `/dealer-requests/${id}/cancel`, method: 'POST', body: { reason } }),
      invalidatesTags: [{ type: 'DealerRequest', id: 'LIST' }],
    }),
    forwardDealerRequestToDepot: builder.mutation({
      query: ({ id, depotId, remarks }) => ({ url: `/dealer-requests/${id}/forward-to-depot`, method: 'POST', body: { depotId, remarks } }),
      invalidatesTags: [{ type: 'DealerRequest', id: 'LIST' }],
    }),
    sendBackDealerRequest: builder.mutation({
      query: ({ id, depotId, remarks }) => ({ url: `/dealer-requests/${id}/send-back`, method: 'POST', body: { depotId, remarks } }),
      invalidatesTags: [{ type: 'DealerRequest', id: 'LIST' }],
    }),
    rejectDealerRequest: builder.mutation({
      query: ({ id, reason }) => ({ url: `/dealer-requests/${id}/reject`, method: 'POST', body: { reason } }),
      invalidatesTags: [{ type: 'DealerRequest', id: 'LIST' }],
    }),
    forwardDealerRequestToUrc: builder.mutation({
      query: ({ id, urcId, remarks }) => ({ url: `/dealer-requests/${id}/forward-to-urc`, method: 'POST', body: { urcId, remarks } }),
      invalidatesTags: [{ type: 'DealerRequest', id: 'LIST' }],
    }),
    submitDealerVerification: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/dealer-requests/${id}/submit-verification`, method: 'POST', body }),
      invalidatesTags: [{ type: 'DealerRequest', id: 'LIST' }],
    }),
    submitDepotVerification: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/dealer-requests/${id}/submit-depot-verification`, method: 'POST', body }),
      invalidatesTags: [{ type: 'DealerRequest', id: 'LIST' }],
    }),
    recalculateScrutiny: builder.mutation({
      query: (id) => ({ url: `/dealer-requests/${id}/scrutiny`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'DealerRequest', id }],
    }),
    createDealerFromRequest: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/dealer-requests/${id}/create-dealer`, method: 'POST', body }),
      transformResponse: unwrap,
      // the new dealer must also show up in the dealer lists
      invalidatesTags: [{ type: 'DealerRequest', id: 'LIST' }, 'Dealer', 'OemDealer', 'Dashboard'],
    }),

    // photo upload (POST /files, multipart) - same endpoint the rest of the portal uses
    uploadDealerRequestPhotos: builder.mutation({
      query: (formData) => ({ url: '/files', method: 'POST', body: formData }),
      transformResponse: unwrap,
    }),
  }),
});

export const {
  useGetDealerRequestsQuery,
  useGetDealerRequestByIdQuery,
  useGetDealerRequestSummaryQuery,
  useGetMyUrcsForDealerRequestsQuery,
  useCreateDealerRequestMutation,
  useCancelDealerRequestMutation,
  useForwardDealerRequestToDepotMutation,
  useSendBackDealerRequestMutation,
  useRejectDealerRequestMutation,
  useForwardDealerRequestToUrcMutation,
  useSubmitDealerVerificationMutation,
  useSubmitDepotVerificationMutation,
  useRecalculateScrutinyMutation,
  useCreateDealerFromRequestMutation,
  useUploadDealerRequestPhotosMutation,
} = dealerRequestApi;

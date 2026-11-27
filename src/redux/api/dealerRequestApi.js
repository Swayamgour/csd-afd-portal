
import { api } from '../baseApi';

const unwrap = (r) => r?.data ?? r;

const listOf = (r) => ({
  items: Array.isArray(r?.data)
    ? r.data
    : Array.isArray(r?.data?.items)
      ? r.data.items
      : [],
  meta: r?.meta || {},
});

/**
 * New-dealer onboarding workflow
 *
 * OEM raises request
 * -> Admin forwards to depot (auto-selected by state)
 * -> Depot verifies and uploads documents
 * -> Admin approves
 * -> Dealer is automatically created and email is sent
 */
export const dealerRequestApi = api.injectEndpoints({
  endpoints: (builder) => ({

    // Get all dealer requests
    getDealerRequests: builder.query({
      query: (params = {}) => ({
        url: '/dealer-requests',
        params,
      }),
      transformResponse: listOf,
      providesTags: (res) => [
        ...(res?.items || []).map((r) => ({
          type: 'DealerRequest',
          id: r._id,
        })),
        { type: 'DealerRequest', id: 'LIST' },
      ],
    }),

    // Get dealer request by ID
    getDealerRequestById: builder.query({
      query: (id) => `/dealer-requests/${id}`,
      transformResponse: unwrap,
      providesTags: (_r, _e, id) => [
        { type: 'DealerRequest', id },
      ],
    }),

    // Get dealer request summary
    getDealerRequestSummary: builder.query({
      query: () => '/dealer-requests/summary',
      transformResponse: unwrap,
      providesTags: [
        { type: 'DealerRequest', id: 'LIST' },
      ],
    }),

    // Admin: Get depots of dealer's state
    getDealerRequestDepotOptions: builder.query({
      query: (id) => `/dealer-requests/${id}/depot-options`,
      transformResponse: unwrap,
    }),

    // Create dealer request
    createDealerRequest: builder.mutation({
      query: (body) => ({
        url: '/dealer-requests',
        method: 'POST',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: [
        { type: 'DealerRequest', id: 'LIST' },
      ],
    }),

    // Cancel dealer request
    cancelDealerRequest: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/dealer-requests/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [
        { type: 'DealerRequest', id: 'LIST' },
      ],
    }),

    // Forward dealer request to depot
    forwardDealerRequestToDepot: builder.mutation({
      query: ({ id, depotId, remarks }) => ({
        url: `/dealer-requests/${id}/forward-to-depot`,
        method: 'POST',
        body: { depotId, remarks },
      }),
      invalidatesTags: [
        { type: 'DealerRequest', id: 'LIST' },
      ],
    }),

    // Send request back
    sendBackDealerRequest: builder.mutation({
      query: ({ id, remarks }) => ({
        url: `/dealer-requests/${id}/send-back`,
        method: 'POST',
        body: { remarks },
      }),
      invalidatesTags: [
        { type: 'DealerRequest', id: 'LIST' },
      ],
    }),

    // Reject dealer request
    rejectDealerRequest: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/dealer-requests/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [
        { type: 'DealerRequest', id: 'LIST' },
      ],
    }),

    // Depot submits verification
    submitDepotVerification: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/dealer-requests/${id}/submit-depot-verification`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'DealerRequest', id: 'LIST' },
        { type: 'DealerRequest', id: 'DETAIL' },
      ],
    }),

    // Recalculate scrutiny
    recalculateScrutiny: builder.mutation({
      query: (id) => ({
        url: `/dealer-requests/${id}/scrutiny`,
        method: 'POST',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'DealerRequest', id },
        { type: 'DealerRequest', id: 'LIST' },
      ],
    }),

    // Approve dealer request
    // Dealer and login are created automatically
    // Email is sent to the dealer
    approveDealerRequest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/dealer-requests/${id}/approve`,
        method: 'POST',
        body,
      }),
      transformResponse: unwrap,
      invalidatesTags: [
        { type: 'DealerRequest', id: 'LIST' },
        'Dealer',
        'OemDealer',
        'Dashboard',
      ],
    }),

    // Upload dealer request photos
    // POST /files (multipart/form-data)
    uploadDealerRequestPhotos: builder.mutation({
      query: (formData) => ({
        url: '/files',
        method: 'POST',
        body: formData,
      }),
      transformResponse: unwrap,
    }),

  }),
});

export const {
  useGetDealerRequestsQuery,
  useGetDealerRequestByIdQuery,
  useGetDealerRequestSummaryQuery,
  useGetDealerRequestDepotOptionsQuery,
  useCreateDealerRequestMutation,
  useCancelDealerRequestMutation,
  useForwardDealerRequestToDepotMutation,
  useSendBackDealerRequestMutation,
  useRejectDealerRequestMutation,
  useSubmitDepotVerificationMutation,
  useRecalculateScrutinyMutation,
  useApproveDealerRequestMutation,
  useUploadDealerRequestPhotosMutation,
} = dealerRequestApi;

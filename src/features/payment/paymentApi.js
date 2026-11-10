import { api } from '../../redux/api';

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // gateways the beneficiary can pick at checkout: [{ gateway:'SBIEPAY'|'NDML', label, available, reason }]
    getPaymentGateways: builder.query({
      query: () => '/payments/gateways',
      transformResponse: (response) => (Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []),
      keepUnusedDataFor: 60,
    }),

    // body: { demandId, gateway? }  -> { paymentNo, amount, gateway, checkout, demandId }
    createPayment: builder.mutation({
      query: (body) => ({
        url: '/payments/initiate',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Payment', 'Demand'],
    }),

    verifyPayment: builder.mutation({
      query: (body) => ({
        url: '/payments/verify',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Payment', 'Demand', 'Order', 'Dashboard'],
    }),

    getPayments: builder.query({
      query: (params = {}) => ({
        url: '/payments',
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
      providesTags: ['Payment'],
    }),

    getPaymentById: builder.query({
      query: (id) => `/payments/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (_result, _error, id) => [{ type: 'Payment', id }, 'Payment'],
    }),

    // polled by the result page after the browser returns from SBIePay / NDML (the server re-verifies with the gateway)
    getPaymentStatus: builder.query({
      query: (id) => `/payments/${id}/status`,
      transformResponse: (response) => response?.data || response,
      providesTags: (_r, _e, id) => [{ type: 'Payment', id }],
    }),

    // manual "Check status" button: asks the gateway again (SBIePay / NDML only)
    reverifyGatewayPayment: builder.mutation({
      query: (id) => ({ url: `/payments/${id}/verify`, method: 'POST', body: {} }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Payment', 'Demand', 'Order', 'Dashboard'],
    }),

    // dev / UAT only (mock provider)
    mockCompletePayment: builder.mutation({
      query: (body) => ({ url: '/payments/mock/complete', method: 'POST', body }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Payment', 'Demand', 'Order', 'Dashboard'],
    }),

    submitDirectTransfer: builder.mutation({
      query: (body) => ({
        url: '/payments/direct-transfer',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Payment', 'Demand', 'Order', 'Dashboard'],
    }),
  }),
});

export const {
  useGetPaymentGatewaysQuery,
  useGetPaymentStatusQuery,
  useReverifyGatewayPaymentMutation,
  useMockCompletePaymentMutation,
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  useSubmitDirectTransferMutation,
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
} = paymentApi;


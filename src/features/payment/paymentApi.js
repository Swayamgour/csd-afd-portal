import { api } from '../../redux/api';

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPayment: builder.mutation({
      query: (body) => ({
        url: '/payments/create',
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
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  useSubmitDirectTransferMutation,
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
} = paymentApi;


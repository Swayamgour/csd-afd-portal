import { api } from '../../redux/api'

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),

    sendOtp: builder.mutation({
      query: (body) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body,
      }),
    }),

    verifyOtp: builder.mutation({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),

    verifyCredentials: builder.mutation({
      query: (body) => ({
        url: '/auth/verify-credentials',
        method: 'POST',
        body,
      }),
    }),

    login: builder.mutation({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth', 'Beneficiary', 'Dashboard'],
    }),

    loginOtp: builder.mutation({
      query: (body) => ({
        url: '/auth/login-otp',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth', 'Beneficiary', 'Dashboard'],
    }),

    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),

    checkDuplicates: builder.mutation({
      query: (body) => ({
        url: '/auth/check-duplicates',
        method: 'POST',
        body,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'Beneficiary', 'Dashboard'],
    }),
  }),
})

export const {
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useVerifyCredentialsMutation,
  useCheckDuplicatesMutation,
  useLoginMutation,
  useLoginOtpMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi
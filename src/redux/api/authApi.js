import { api } from '../baseApi'

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

    // getMe() uses the stored token; getMe(token) verifies a specific token.
    getMe: builder.query({
      query: (token) => ({
        url: '/auth/me',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }),
      providesTags: ['Auth'],
    }),

    // ---- Password / username recovery ----
    forgotPassword: builder.mutation({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),

    resetPassword: builder.mutation({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),

    forgotUsername: builder.mutation({
      query: (body) => ({ url: '/auth/forgot-username', method: 'POST', body }),
    }),

    verifyForgotUsername: builder.mutation({
      query: (body) => ({ url: '/auth/verify-forgot-username', method: 'POST', body }),
    }),

    checkDuplicates: builder.mutation({
      query: (body) => ({
        url: '/auth/check-duplicates',
        method: 'POST',
        body,
      }),
    }),

    // ---- DigiLocker (beneficiaries only). start/callback are browser redirects, see utils/digilocker.js ----
    digilockerTicketInfo: builder.mutation({
      query: (body) => ({ url: '/auth/digilocker/ticket-info', method: 'POST', body }),
      transformResponse: (r) => r?.data || r,
    }),

    digilockerCompleteLogin: builder.mutation({
      query: (body) => ({ url: '/auth/digilocker/complete-login', method: 'POST', body }),
      transformResponse: (r) => r?.data || r,
      invalidatesTags: ['Auth', 'Beneficiary', 'Dashboard'],
    }),

    digilockerCompleteRegistration: builder.mutation({
      query: (body) => ({ url: '/auth/digilocker/complete-registration', method: 'POST', body }),
      transformResponse: (r) => r?.data || r,
    }),

    digilockerLinkStart: builder.mutation({
      query: (body) => ({ url: '/auth/digilocker/link/start', method: 'POST', body }),
      transformResponse: (r) => r?.data || r,
    }),

    digilockerLinkComplete: builder.mutation({
      query: (body) => ({ url: '/auth/digilocker/link/complete', method: 'POST', body }),
      transformResponse: (r) => r?.data || r,
      invalidatesTags: ['Auth'],
    }),

    digilockerUnlink: builder.mutation({
      query: (body) => ({ url: '/auth/digilocker/unlink', method: 'DELETE', body }),
      transformResponse: (r) => r?.data || r,
      invalidatesTags: ['Auth'],
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
  useLazyGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useForgotUsernameMutation,
  useVerifyForgotUsernameMutation,
  useLogoutMutation,
  useDigilockerTicketInfoMutation,
  useDigilockerCompleteLoginMutation,
  useDigilockerCompleteRegistrationMutation,
  useDigilockerLinkStartMutation,
  useDigilockerLinkCompleteMutation,
  useDigilockerUnlinkMutation,
} = authApi
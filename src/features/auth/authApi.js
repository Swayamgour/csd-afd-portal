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

    login: builder.mutation({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),

    loginOtp: builder.mutation({
      query: (body) => ({
        url: '/auth/login-otp',
        method: 'POST',
        body,
      }),
    }),

    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),

      invalidatesTags: ['Auth'],
    }),
  }),
})

export const {
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useLoginMutation,
  useLoginOtpMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi
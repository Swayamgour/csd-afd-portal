import { api } from '../../redux/api';

export const beneficiaryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBeneficiaryDashboard: builder.query({
      query: () => '/beneficiaries/dashboard',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Dashboard', 'Beneficiary', 'Demand', 'Order'],
    }),

    getMyProfile: builder.query({
      query: () => '/beneficiaries/me',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Beneficiary'],
    }),

    updateMyProfile: builder.mutation({
      query: (body) => ({
        url: '/beneficiaries/me',
        method: 'PUT',
        body,
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Beneficiary', 'Dashboard', 'Auth', 'User'],
    }),

    uploadBeneficiaryDocument: builder.mutation({
      query: ({ type, fileUrl }) => ({
        url: '/beneficiaries/me/documents',
        method: 'POST',
        body: { type, fileUrl },
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Beneficiary'],
    }),

    uploadFile: builder.mutation({
      query: (formData) => ({
        url: '/files',
        method: 'POST',
        body: formData,
      }),
      transformResponse: (response) => response?.data || response,
    }),
  }),
});

export const {
  useGetBeneficiaryDashboardQuery,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useUploadBeneficiaryDocumentMutation,
  useUploadFileMutation,
} = beneficiaryApi;

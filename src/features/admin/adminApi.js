import { api } from '../../redux/api';

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params) => ({
        url: '/users',
        params,
      }),
      transformResponse: (response) => {
        let list = [];
        if (Array.isArray(response)) {
          list = response;
        } else if (Array.isArray(response?.data)) {
          list = response.data;
        } else if (Array.isArray(response?.data?.items)) {
          list = response.data.items;
        }
        return list.map((u) => ({
          ...u,
          id: String(u._id || u.id),
          _id: String(u._id || u.id),
        }));
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id, _id }) => ({ type: 'User', id: id || _id })),
              { type: 'User', id: 'LIST' },
              'User',
            ]
          : [{ type: 'User', id: 'LIST' }, 'User'],
    }),

    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: ['User'],
    }),

    approveUser: builder.mutation({
      query: ({ id, remarks }) => ({
        url: `/users/${id}/approve`,
        method: 'PATCH',
        body: { remarks },
      }),
      invalidatesTags: ['User', 'Beneficiary', 'Auth'],
    }),

    rejectUser: builder.mutation({
      query: ({ id, remarks }) => ({
        url: `/users/${id}/reject`,
        method: 'PATCH',
        body: { remarks },
      }),
      invalidatesTags: ['User', 'Beneficiary', 'Auth'],
    }),

    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['User', 'Beneficiary'],
    }),

    getBeneficiaries: builder.query({
      query: (params) => ({
        url: '/beneficiaries',
        params,
      }),
      providesTags: ['Beneficiary'],
    }),

    verifyBeneficiary: builder.mutation({
      query: ({ id, status, remarks }) => ({
        url: `/beneficiaries/${id}/verify`,
        method: 'PATCH',
        body: { status, remarks },
      }),
      invalidatesTags: ['Beneficiary', 'User', 'Auth'],
    }),

    // Banners Management
    getBanners: builder.query({
      query: (params) => ({
        url: '/banners',
        params,
      }),
      transformResponse: (response) => (Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])),
      providesTags: ['Banner'],
    }),

    getAllAdminBanners: builder.query({
      query: (params) => ({
        url: '/banners/admin/all',
        params,
      }),
      transformResponse: (response) => (Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : [])),
      providesTags: ['Banner'],
    }),

    createBanner: builder.mutation({
      query: (body) => ({
        url: '/banners',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Banner'],
    }),

    updateBanner: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/banners/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Banner'],
    }),

    toggleBannerStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/banners/${id}/status`,
        method: 'PATCH',
        body: { isActive },
      }),
      invalidatesTags: ['Banner'],
    }),

    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/banners/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useApproveUserMutation,
  useRejectUserMutation,
  useUpdateUserStatusMutation,
  useGetBeneficiariesQuery,
  useVerifyBeneficiaryMutation,
  useGetBannersQuery,
  useGetAllAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useToggleBannerStatusMutation,
  useDeleteBannerMutation,
} = adminApi;

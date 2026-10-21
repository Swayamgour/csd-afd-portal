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

    createUser: builder.mutation({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User', 'Beneficiary'],
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

    // Admin / CSD-HO Enterprise Dashboard
    getAdminSummary: builder.query({
      query: () => '/admin/dashboard/summary',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Dashboard'],
    }),

    getAdminAnalytics: builder.query({
      query: (params) => ({
        url: '/admin/dashboard/analytics',
        params,
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Dashboard'],
    }),

    getAdminRecentDemands: builder.query({
      query: () => '/admin/dashboard/recent-demands',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Demand', 'Dashboard'],
    }),

    getAdminRecentUsers: builder.query({
      query: () => '/admin/dashboard/recent-users',
      transformResponse: (response) => response?.data || response,
      providesTags: ['User', 'Dashboard'],
    }),

    getAdminActivity: builder.query({
      query: () => '/admin/dashboard/activity',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Audit', 'Dashboard'],
    }),

    // Role-Specific Dashboards (Section 11)
    getOemSummary: builder.query({
      query: () => '/dashboards/oem-summary',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Dashboard', 'Order', 'Product'],
    }),

    getDealerSummary: builder.query({
      query: () => '/dashboards/dealer-summary',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Dashboard', 'Demand', 'Order'],
    }),

    getDepotSummary: builder.query({
      query: () => '/dashboards/depot-summary',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Dashboard', 'Demand', 'Order'],
    }),

    getUrcSummary: builder.query({
      query: () => '/dashboards/urc-summary',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Dashboard', 'Order'],
    }),

    getCsDirectorSummary: builder.query({
      query: () => '/dashboards/cs-director-summary',
      transformResponse: (response) => response?.data || response,
      providesTags: ['Dashboard', 'Beneficiary', 'Demand', 'Ticket'],
    }),

    // Dynamic Section 22 Reports
    getDemandsReport: builder.query({
      query: (params) => ({ url: '/reports/demands-report', params }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Report'],
    }),

    getBeneficiariesReport: builder.query({
      query: (params) => ({ url: '/reports/beneficiaries-report', params }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Report'],
    }),

    getPaymentsReport: builder.query({
      query: (params) => ({ url: '/reports/payments-report', params }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Report'],
    }),

    getOrdersReport: builder.query({
      query: (params) => ({ url: '/reports/orders-report', params }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Report'],
    }),

    getOemsReport: builder.query({
      query: (params) => ({ url: '/reports/oems-report', params }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Report'],
    }),

    getDealersReport: builder.query({
      query: (params) => ({ url: '/reports/dealers-report', params }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Report'],
    }),

    getDepotsReport: builder.query({
      query: (params) => ({ url: '/reports/depots-report', params }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Report'],
    }),

    getUrcsReport: builder.query({
      query: (params) => ({ url: '/reports/urcs-report', params }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Report'],
    }),

    getProductsReport: builder.query({
      query: (params) => ({ url: '/reports/products-report', params }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Report'],
    }),

    getRefundsReport: builder.query({
      query: (params) => ({ url: '/reports/refunds-report', params }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Report'],
    }),

    getAuditReport: builder.query({
      query: (params) => ({ url: '/audit', params }),
      transformResponse: (response) => response?.data?.items || response?.data || response,
      providesTags: ['Audit', 'Report'],
    }),

    getAuthReport: builder.query({
      query: (params) => ({ url: '/audit/auth-logs', params }),
      transformResponse: (response) => response?.data?.items || response?.data || response,
      providesTags: ['Audit', 'Report'],
    }),

    getContent: builder.query({
      query: (params) => ({ url: '/content', params }),
      transformResponse: (response) => response?.data?.items || response?.data || response || [],
      providesTags: ['Content'],
    }),

    createContent: builder.mutation({
      query: (body) => ({
        url: '/content',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Content'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
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
  useGetAdminSummaryQuery,
  useGetAdminAnalyticsQuery,
  useGetAdminRecentDemandsQuery,
  useGetAdminRecentUsersQuery,
  useGetAdminActivityQuery,
  useGetOemSummaryQuery,
  useGetDealerSummaryQuery,
  useGetDepotSummaryQuery,
  useGetUrcSummaryQuery,
  useGetCsDirectorSummaryQuery,
  useGetDemandsReportQuery,
  useGetBeneficiariesReportQuery,
  useGetPaymentsReportQuery,
  useGetOrdersReportQuery,
  useGetOemsReportQuery,
  useGetDealersReportQuery,
  useGetDepotsReportQuery,
  useGetUrcsReportQuery,
  useGetProductsReportQuery,
  useGetRefundsReportQuery,
  useGetAuditReportQuery,
  useGetAuthReportQuery,
  useGetContentQuery,
  useCreateContentMutation,
} = adminApi;


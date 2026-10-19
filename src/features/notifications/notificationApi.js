import { api } from '../../redux/api';

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (params = {}) => ({
        url: '/notifications',
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
        return { items, meta, unread: meta.unread || 0 };
      },
      providesTags: ['Notification'],
    }),

    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
        body: {},
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Notification', 'Dashboard'],
    }),

    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      transformResponse: (response) => response?.data || response,
      invalidatesTags: ['Notification', 'Dashboard'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;

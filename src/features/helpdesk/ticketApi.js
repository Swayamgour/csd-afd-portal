import { api } from '../../redux/api';

export const ticketApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTickets: builder.query({
      query: (params) => ({
        url: '/helpdesk/tickets',
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data?.items)) return response.data.items;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.items)) return response.items;
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ _id, id }) => ({ type: 'Ticket', id: _id || id })),
              { type: 'Ticket', id: 'LIST' },
              'Ticket',
            ]
          : [{ type: 'Ticket', id: 'LIST' }, 'Ticket'],
    }),

    getTicketById: builder.query({
      query: (id) => `/helpdesk/tickets/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (result, error, id) => [{ type: 'Ticket', id }],
    }),

    createTicket: builder.mutation({
      query: (body) => ({
        url: '/helpdesk/tickets',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }, 'Ticket', 'Dashboard'],
    }),

    updateTicketStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/helpdesk/tickets/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
        'Ticket',
        'Dashboard',
      ],
    }),

    assignTicket: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/helpdesk/tickets/${id}/assign`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
        'Ticket',
      ],
    }),

    claimTicket: builder.mutation({
      query: (id) => ({
        url: `/helpdesk/tickets/${id}/claim`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
        'Ticket',
      ],
    }),

    addTicketMessage: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/helpdesk/tickets/${id}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Ticket', id }],
    }),

    getHelpdeskMis: builder.query({
      query: (params) => ({
        url: '/reports/helpdesk/mis',
        params,
      }),
      transformResponse: (response) => response?.data || response,
      providesTags: ['Report'],
    }),

    getKbArticles: builder.query({
      query: (params) => ({
        url: '/helpdesk/kb',
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response?.data?.items)) return response.data.items;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.items)) return response.items;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: ['Ticket'],
    }),

    getKbArticleById: builder.query({
      query: (id) => `/helpdesk/kb/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Ticket'],
    }),

    createKbArticle: builder.mutation({
      query: (body) => ({
        url: '/helpdesk/kb',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Ticket'],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation,
  useClaimTicketMutation,
  useAddTicketMessageMutation,
  useGetHelpdeskMisQuery,
  useGetKbArticlesQuery,
  useGetKbArticleByIdQuery,
  useCreateKbArticleMutation,
} = ticketApi;


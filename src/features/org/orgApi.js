import { api } from '../../redux/api';

const extractArray = (response) => {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response)) return response;
  return [];
};

export const orgApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDealers: builder.query({
      query: (params = {}) => ({
        url: '/dealers',
        params,
      }),
      transformResponse: extractArray,
      providesTags: ['Dealer'],
    }),

    getDealerById: builder.query({
      query: (id) => `/dealers/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Dealer'],
    }),

    getDepots: builder.query({
      query: (params = {}) => ({
        url: '/depots',
        params,
      }),
      transformResponse: extractArray,
      providesTags: ['Depot'],
    }),

    getDepotById: builder.query({
      query: (id) => `/depots/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Depot'],
    }),

    getUrcs: builder.query({
      query: (params = {}) => ({
        url: '/urcs',
        params,
      }),
      transformResponse: extractArray,
      providesTags: ['Urc'],
    }),

    getUrcById: builder.query({
      query: (id) => `/urcs/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Urc'],
    }),

    getOems: builder.query({
      query: (params = {}) => ({
        url: '/oems',
        params,
      }),
      transformResponse: extractArray,
      providesTags: ['Oem'],
    }),

    getOemById: builder.query({
      query: (id) => `/oems/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['Oem'],
    }),

    createOem: builder.mutation({
      query: (body) => ({
        url: '/oems',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Oem', 'Dashboard'],
    }),

    updateOem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/oems/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Oem', 'Dashboard'],
    }),

    createDealer: builder.mutation({
      query: (body) => ({
        url: '/dealers',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dealer', 'Dashboard'],
    }),

    updateDealer: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/dealers/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Dealer', 'Dashboard'],
    }),

    createDepot: builder.mutation({
      query: (body) => ({
        url: '/depots',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Depot', 'Dashboard'],
    }),

    updateDepot: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/depots/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Depot', 'Dashboard'],
    }),

    createUrc: builder.mutation({
      query: (body) => ({
        url: '/urcs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Urc', 'Dashboard'],
    }),

    updateUrc: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/urcs/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Urc', 'Dashboard'],
    }),

    getPriceZones: builder.query({
      query: (params = {}) => ({
        url: '/price-zones',
        params,
      }),
      transformResponse: extractArray,
      providesTags: ['PriceZone'],
    }),

    getPriceZoneById: builder.query({
      query: (id) => `/price-zones/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: ['PriceZone'],
    }),
  }),
});

export const {
  useGetDealersQuery,
  useGetDealerByIdQuery,
  useCreateDealerMutation,
  useUpdateDealerMutation,
  useGetDepotsQuery,
  useGetDepotByIdQuery,
  useCreateDepotMutation,
  useUpdateDepotMutation,
  useGetUrcsQuery,
  useGetUrcByIdQuery,
  useCreateUrcMutation,
  useUpdateUrcMutation,
  useGetOemsQuery,
  useGetOemByIdQuery,
  useCreateOemMutation,
  useUpdateOemMutation,
  useGetPriceZonesQuery,
  useGetPriceZoneByIdQuery,
} = orgApi;


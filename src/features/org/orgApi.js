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
    }),
  }),
});

export const {
  useGetDealersQuery,
  useGetDealerByIdQuery,
  useGetDepotsQuery,
  useGetDepotByIdQuery,
  useGetUrcsQuery,
  useGetUrcByIdQuery,
  useGetOemsQuery,
} = orgApi;

import { api } from '../../redux/api';

export const productApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params = {}) => ({
        url: '/products',
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
        return { items, meta };
      },
      providesTags: (result) =>
        result?.items && Array.isArray(result.items)
          ? [
              ...result.items.map(({ _id, id }) => ({ type: 'Product', id: _id || id })),
              { type: 'Product', id: 'LIST' },
              'Product',
            ]
          : [{ type: 'Product', id: 'LIST' }, 'Product'],
    }),

    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      transformResponse: (response) => response?.data || response,
      providesTags: (_result, _error, id) => [{ type: 'Product', id }, 'Product'],
    }),

    getCategories: builder.query({
      query: (params = {}) => ({
        url: '/categories',
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data?.items)) return response.data.items;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: ['Category'],
    }),

    getBrands: builder.query({
      query: (params = {}) => ({
        url: '/brands',
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data?.items)) return response.data.items;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: ['Brand'],
    }),

    checkProductEligibility: builder.mutation({
      query: ({ productId, quantity = 1, beneficiaryId }) => ({
        url: '/eligibility/check',
        method: 'POST',
        body: { productId, quantity, beneficiaryId },
      }),
      transformResponse: (response) => response?.data || response,
    }),

    getEligibilityRules: builder.query({
      query: (params = {}) => ({
        url: '/eligibility/rules',
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data?.items)) return response.data.items;
        if (Array.isArray(response)) return response;
        return [];
      },
      providesTags: ['Eligibility'],
    }),

    getProductOptions: builder.query({
      query: (args) => {
        const id = typeof args === 'string' ? args : args?.id;
        const params = {};
        if (typeof args === 'object' && args !== null) {
          if (args.priceZoneId) params.priceZoneId = args.priceZoneId;
          if (args.depotId) params.depotId = args.depotId;
          if (args.dealerId) params.dealerId = args.dealerId;
          if (args.state) params.state = args.state;
        }
        return {
          url: `/products/${id}/options`,
          params,
        };
      },
      transformResponse: (response) => response?.data || response,
      providesTags: (_result, _error, args) => {
        const id = typeof args === 'string' ? args : args?.id;
        return [
          { type: 'Product', id },
          'Product',
          'Dealer',
          'Depot',
          'Urc',
          'PriceZone',
          'Oem',
          'DealerProduct',
        ];
      },
    }),

    createProduct: builder.mutation({
      query: (body) => ({
        url: '/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Product', 'Dashboard'],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'LIST' },
        'Product',
        'Dashboard',
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Product', id: 'LIST' }, 'Product', 'Dashboard'],
    }),

    uploadFiles: builder.mutation({
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
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useCheckProductEligibilityMutation,
  useGetEligibilityRulesQuery,
  useGetProductOptionsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadFilesMutation,
} = productApi;

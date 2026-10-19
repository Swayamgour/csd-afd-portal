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
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetBrandsQuery,
  useCheckProductEligibilityMutation,
  useGetEligibilityRulesQuery,
} = productApi;

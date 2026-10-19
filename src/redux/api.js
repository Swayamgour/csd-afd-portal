import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const BASE_URL = 'http://localhost:5000/api/v1'

export const api = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,

    prepareHeaders: (headers) => {
      const token = localStorage.getItem('csd_auth_token')

      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }

      headers.set('Content-Type', 'application/json')

      return headers
    },
  }),

  tagTypes: [
    'Auth',
    'Beneficiary',
    'Product',
    'Category',
    'Brand',
    'Demand',
    'Order',
    'Payment',
    'Notification',
  ],

  endpoints: () => ({}),
})
# src/redux — all API calls (RTK Query)

```
src/redux/
├── store.js            configureStore (auth slice + api reducer/middleware)
├── baseApi.js          createApi + fetchBaseQuery, auth header, silent 401 refresh, tagTypes, BASE_URL
├── slices/
│   └── authSlice.js
└── api/                one file per domain, each uses api.injectEndpoints()
    ├── authApi.js          login, verify-credentials, OTP, me, forgot/reset password & username, DigiLocker, duplicates
    ├── adminApi.js         users, banners, content, reports, dashboard
    ├── beneficiaryApi.js   profile, documents, uploads
    ├── productApi.js       products, categories, eligibility, Excel import
    ├── demandApi.js        demands, orders
    ├── paymentApi.js
    ├── ticketApi.js        helpdesk tickets, KB
    ├── notificationApi.js
    ├── orgApi.js           OEM / dealer / depot / URC
    ├── oemApi.js
    ├── dealerRequestApi.js
    └── fileApi.js          downloads (CSV/XLSX/XLSM), templates, protected document preview
```

Rules: components never call `fetch`; add a new endpoint to the matching file in `api/` and use its hook.
The only raw `fetch` left is the token refresh inside `baseApi.js` (it is the re-auth step itself).

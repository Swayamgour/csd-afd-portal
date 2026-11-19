import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { API_BASE_URL } from "../config/env.js";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "../utils/tokenStorage.js";

// const BASE_URL = 'https://csd-afd-backend.onrender.com/api/v1';
const BASE_URL = 'http://localhost:5000/api/v1';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const stateToken = getState()?.auth?.token;
    const token = stateToken || getAccessToken();

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

// Public storefront pages must stay reachable WITHOUT login.
// Protected beneficiary workflows (/checkout, /demands, /payment) are strictly excluded from public paths.
const PUBLIC_PATHS = [
  "/",
  "/products",
  "/search",
  "/compare",
  "/cart",
  "/categories",
  "/register",
  "/info",
  "/login",
  "/forgot-password",
  "/forgot-username",
  "/reset-password",
  "/unauthorized",
  "/session-expired",
  "/auth",
];

const isPublicPath = (pathname = "/") =>
  PUBLIC_PATHS.some((p) => (p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(p + "/")));

// Shared refresh promise to prevent duplicate parallel refresh requests (mutex)
let refreshPromise = null;

const requestTokenRefresh = async (refreshToken) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data?.data || data;
  } catch (err) {
    console.warn("Silent token refresh error:", err);
    return null;
  }
};

const clearSessionAndRedirect = (apiInstance) => {
  clearTokens();
  try { apiInstance?.dispatch?.({ type: "auth/logout" }); } catch { /* ignore */ }
  localStorage.removeItem("csd_auth_user");
  localStorage.removeItem("csd_auth_role");

  if (typeof window !== "undefined" && !isPublicPath(window.location.pathname)) {
    window.location.assign("/login?reason=session-expired");
  }
};

const baseQueryWithReauth = async (args, apiInstance, extraOptions) => {
  let result = await rawBaseQuery(args, apiInstance, extraOptions);

  if (result?.error && result.error.status === 401) {
    const url = typeof args === "string" ? args : args.url;
    const isAuthEndpoint =
      url &&
      (url.includes("/auth/login") ||
        url.includes("/auth/refresh") ||
        url.includes("/auth/verify-credentials") ||
        url.includes("/auth/send-otp") ||
        url.includes("/auth/digilocker/complete-"));

    if (!isAuthEndpoint) {
      const refreshToken = getRefreshToken();

      if (refreshToken) {
        if (!refreshPromise) {
          refreshPromise = requestTokenRefresh(refreshToken).finally(() => {
            refreshPromise = null;
          });
        }

        const newTokens = await refreshPromise;

        if (newTokens && (newTokens.accessToken || newTokens.token)) {
          const nextToken = newTokens.accessToken || newTokens.token;
          setTokens({
            accessToken: nextToken,
            refreshToken: newTokens.refreshToken,
          });

          // Synchronize Redux auth state so getState()?.auth?.token returns the fresh token on retry
          const currentUser = apiInstance.getState()?.auth?.user || null;
          apiInstance.dispatch({
            type: "auth/setCredentials",
            payload: { user: currentUser, token: nextToken }
          });

          // Retry the original query exactly once with the refreshed token
          result = await rawBaseQuery(args, apiInstance, extraOptions);
          return result;
        }
      }

      // No refresh token or refresh failed: drop stale session and redirect if protected
      clearSessionAndRedirect(apiInstance);
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,

  keepUnusedDataFor: 300,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  refetchOnMountOrArgChange: false,

  tagTypes: [
    "Auth",
    "Beneficiary",
    "User",
    "Product",
    "Category",
    "Brand",
    "Demand",
    "DemandNotes",
    "Order",
    "Payment",
    "Notification",
    "Banner",
    "Content",
    "Dashboard",
    "Dealer",
    "Depot",
    "Urc",
    "PriceZone",
    "Eligibility",
    "Oem",
    "DealerProduct",
    "Audit",
    "Report",
    "Ticket",
    "OemDashboard",
    "OemProduct",
    "OemDealer",
    "OemDealerProduct",
    "OemPricing",
    "OemDemand",
    "OemOrder",
    "OemReport",
    "OemProfile",
    "State",
    "ProductPrice",
    "DealerRequest",
  ],

  endpoints: () => ({}),
});
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "../utils/cookie.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";


const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",


  prepareHeaders: (headers, { getState }) => {
    const stateToken = getState()?.auth?.token;
    const token =
      stateToken ||
      localStorage.getItem("csd_auth_token") ||
      getCookie("csd_auth_token") ||
      getCookie("accessToken");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});

// Public storefront pages must stay reachable WITHOUT login.
// A 401 on these pages (guest, or an expired token) must never bounce the visitor to /login.
const PUBLIC_PATHS = [
  "/",
  "/products",
  "/search",
  "/compare",
  "/cart",
  "/categories",
  "/register",
  "/info",
  "/checkout",
  "/demands",
  "/payment",
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

const baseQueryWithReauth = async (args, apiInstance, extraOptions) => {
  const result = await rawBaseQuery(args, apiInstance, extraOptions);
  if (result?.error && result.error.status === 401) {
    const url = typeof args === "string" ? args : args.url;
    if (
      url &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/verify-credentials") &&
      !url.includes("/auth/send-otp") &&
      !url.includes("/auth/digilocker/complete-")
    ) {
      // Drop the stale session either way
      localStorage.removeItem("csd_auth_token");
      localStorage.removeItem("csd_auth_user");
      localStorage.removeItem("csd_auth_role");

      // Redirect ONLY when the user is inside the protected portal (dashboards etc.).
      // Home and the other public storefront pages stay open for guests.
      if (typeof window !== "undefined" && !isPublicPath(window.location.pathname)) {
        window.location.href = "/login";
      }
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
  ],

  endpoints: () => ({}),
});
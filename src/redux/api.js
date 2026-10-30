import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCookie } from "../utils/cookie.js";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

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

const baseQueryWithReauth = async (args, apiInstance, extraOptions) => {
  const result = await rawBaseQuery(args, apiInstance, extraOptions);
  if (result?.error && result.error.status === 401) {
    const url = typeof args === "string" ? args : args.url;
    if (
      url &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/verify-credentials") &&
      !url.includes("/auth/send-otp")
    ) {
      localStorage.removeItem("csd_auth_token");
      localStorage.removeItem("csd_auth_user");
      localStorage.removeItem("csd_auth_role");
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
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

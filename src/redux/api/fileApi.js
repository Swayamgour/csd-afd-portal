import { api, BASE_URL } from '../baseApi';

/**
 * File / binary endpoints (CSV, XLSX, XLSM exports, templates, protected documents).
 * All of them go through the shared base query, so the Authorization header and the
 * silent token refresh work exactly like every other API call.
 *
 * The blob never enters the Redux store: `downloadFile` saves it straight to disk and
 * `getDocumentUrl` stores only a short-lived object URL string.
 */

const API_ORIGIN_PREFIX = /^\/api\/v1(?=\/|$)/;

/** '/api/v1/products/x' | `${BASE_URL}/products/x` -> '/products/x' (absolute non-API urls are left alone). */
export const toApiPath = (url = '') => {
  if (url.startsWith(BASE_URL)) return url.slice(BASE_URL.length) || '/';
  return url.replace(API_ORIGIN_PREFIX, '') || '/';
};

const blobQuery = (baseQuery, url) =>
  baseQuery({ url, method: 'GET', responseHandler: (res) => res.blob() });

/** Turns an error whose body is a Blob (server answered JSON/text) into { status, data: { message } }. */
const normalizeError = async (error) => {
  if (error?.data instanceof Blob) {
    let message;
    try {
      const parsed = JSON.parse(await error.data.text());
      message = parsed?.message;
    } catch {
      /* not JSON */
    }
    return { status: error.status, data: { message: message || `Request failed with status ${error.status}` } };
  }
  return error;
};

export const saveBlob = (blob, filename) => {
  const href = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(href);
};

export const fileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /** downloadFile({ url, filename }) - saves the response as a file. Use `.unwrap()` and read err.data.message. */
    downloadFile: builder.mutation({
      async queryFn({ url, filename }, _api, _extra, baseQuery) {
        const res = await blobQuery(baseQuery, toApiPath(url));
        if (res.error) return { error: await normalizeError(res.error) };
        saveBlob(res.data, filename || `export-${new Date().toISOString().slice(0, 10)}.csv`);
        return { data: true };
      },
    }),

    /**
     * downloadFirstAvailable({ urls: [...], filename }) - tries each url until one succeeds
     * (used for Excel templates that have a primary and a fallback endpoint).
     */
    downloadFirstAvailable: builder.mutation({
      async queryFn({ urls, filename }, _api, _extra, baseQuery) {
        let lastError = { status: 'CUSTOM_ERROR', error: 'Download endpoint returned an error.' };
        for (const url of urls) {
          const res = await blobQuery(baseQuery, toApiPath(url));
          if (!res.error) {
            saveBlob(res.data, filename);
            return { data: true };
          }
          lastError = await normalizeError(res.error);
        }
        return { error: lastError };
      },
    }),

    /** getDocumentUrl(absoluteOrApiUrl) -> object URL string for in-app preview. Caller must URL.revokeObjectURL it. */
    getDocumentUrl: builder.mutation({
      async queryFn(url, _api, _extra, baseQuery) {
        const res = await blobQuery(baseQuery, url);
        if (res.error) return { error: await normalizeError(res.error) };
        return { data: URL.createObjectURL(res.data) };
      },
    }),
  }),
});

export const {
  useDownloadFileMutation,
  useDownloadFirstAvailableMutation,
  useGetDocumentUrlMutation,
} = fileApi;

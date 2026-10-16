/**
 * Central API Client abstraction.
 * Currently backed by in-memory mock state with simulated network latency (150-300ms).
 * Easily replaced with axios or fetch when real REST / GraphQL endpoints are deployed.
 */

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiClient = {
  async get(endpoint, data = {}) {
    await wait();
    return { status: 200, data };
  },

  async post(endpoint, payload = {}) {
    await wait(220);
    return { status: 201, data: payload };
  },

  async put(endpoint, payload = {}) {
    await wait(200);
    return { status: 200, data: payload };
  },

  async delete(endpoint) {
    await wait(180);
    return { status: 200, success: true };
  }
};

import { refreshAccessToken } from "./auth";

export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem("token");
  
  // Don't set Content-Type if we're sending FormData
  const headers = options.body instanceof FormData
    ? {
        Authorization: `Bearer ${token}`,
        ...options.headers
      }
    : {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers
      };

  options.headers = headers;
  options.credentials = "include";

  let response = await fetch(url, options);

  if (response.status === 401) {
    // Try to refresh the token
    try {
      const newToken = await refreshAccessToken();
      headers.Authorization = `Bearer ${newToken}`;
      options.headers = headers;
      response = await fetch(url, options); // Retry original request
    } catch (err) {
      throw new Error("Authentication failed");
    }
  }

  return response;
}

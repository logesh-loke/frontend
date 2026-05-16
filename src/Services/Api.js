// src/Services/Api.js

const BASE_URL = "http://localhost:8080";

// ==========================
// Refresh Token
// ==========================
async function refreshToken() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    // Server Busy / Rate Limit
    if (res.status === 429) {
      return {
        error: "SERVER_BUSY",
      };
    }

    // Unauthorized
    if (res.status === 401) {
      return {
        error: "UNAUTHORIZED",
      };
    }

    // Other Errors
    if (!res.ok) {
      return {
        error: "REFRESH_FAILED",
      };
    }

    const data = await res.json();

    if (!data?.accessToken) {
      return {
        error: "NO_TOKEN",
      };
    }

    // Save New Token
    localStorage.setItem("token", data.accessToken);

    return {
      accessToken: data.accessToken,
    };

  } catch (error) {
    console.error("Refresh token error:", error);

    return {
      error: "NETWORK_ERROR",
    };
  }
}

// ==========================
// Logout User
// ==========================
export async function logoutUser() {
  try {
    await fetch(`${BASE_URL}/api/v1/logout`, {
      method: "POST",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout API error:", err);
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/login";
}

// ==========================
// API Wrapper
// ==========================
export async function apiFetch(url, options = {}, retry = false) {
  try {
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // Add Token
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // API Request
    let response = await fetch(BASE_URL + url, {
      ...options,
      headers,
      credentials: "include",
    });

    // ==========================
    // Token Expired
    // ==========================
    if (response.status === 401 && !retry) {

      console.warn("Token expired. Refreshing...");

      const refresh = await refreshToken();

      // ==========================
      // Refresh Success
      // ==========================
      if (refresh?.accessToken) {

        headers.Authorization = `Bearer ${refresh.accessToken}`;

        response = await fetch(BASE_URL + url, {
          ...options,
          headers,
          credentials: "include",
        });

        return response;
      }

      // ==========================
      // Server Busy
      // ==========================
      if (refresh?.error === "SERVER_BUSY") {

        alert("Server busy. Please try again later.");

        return response;
      }

      // ==========================
      // Network Error
      // ==========================
      if (refresh?.error === "NETWORK_ERROR") {

        alert("Network error. Check your internet connection.");

        return response;
      }

      // ==========================
      // Unauthorized
      // ==========================
      if (
        refresh?.error === "UNAUTHORIZED" ||
        refresh?.error === "REFRESH_FAILED" ||
        refresh?.error === "NO_TOKEN"
      ) {

        console.error("Refresh failed. Logging out...");

        await logoutUser();

        return;
      }
    }

    return response;

  } catch (err) {

    console.error("API FETCH ERROR:", err);

    alert("Something went wrong.");

    throw err;
  }
}
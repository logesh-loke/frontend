// src/Services/Api.js

const BASE_URL = "http://localhost:8080";

// 🔁 Refresh Token
async function refreshToken() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();

    if (!data.accessToken) {
      throw new Error("No access token received");
    }

    localStorage.setItem("token", data.accessToken);

    return data.accessToken;
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    return null;
  }
}

// 🌐 API Wrapper
export async function apiFetch(url, options = {}, retry = false) {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(BASE_URL + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
    });

    // 🔐 Handle token expiry
    if (response.status === 401 && !retry) {
      console.warn("🔁 Token expired, trying refresh...");

      const newToken = await refreshToken();

      if (newToken) {
        return apiFetch(url, options, true); // ✅ retry cleanly
      } else {
        console.error("❌ Refresh failed → logout");

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/login";

        throw new Error("Session expired");
      }
    }

    return response;
  } catch (err) {
    console.error("❌ API FETCH ERROR:", err);
    throw err;
  }
}
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

    if (!data?.accessToken) {
      throw new Error("No access token received");
    }

    localStorage.setItem("token", data.accessToken);

    return data.accessToken;
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    return null;
  }
}

// 🚪 Logout (IMPORTANT)
export async function logoutUser() {
  try {
    await fetch(`${BASE_URL}/api/v1/logout`, {
      method: "POST",
      credentials: "include", // 🔥 clears cookie from backend
    });
  } catch (err) {
    console.error("Logout API error:", err);
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/login";
}

// 🌐 API Wrapper
export async function apiFetch(url, options = {}, retry = false) {
  try {
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let response = await fetch(BASE_URL + url, {
      ...options,
      headers,
      credentials: "include",
    });

    // 🔐 Token expired → refresh once
    if (response.status === 401 && !retry) {
      console.warn("🔁 Token expired, refreshing...");

      const newToken = await refreshToken();

      if (newToken) {
        headers.Authorization = `Bearer ${newToken}`;

        response = await fetch(BASE_URL + url, {
          ...options,
          headers,
          credentials: "include",
        });

        return response;
      } else {
        console.error("❌ Refresh failed → logout");
        await logoutUser();
        return;
      }
    }

    return response;

  } catch (err) {
    console.error("❌ API FETCH ERROR:", err);
    throw err;
  }
}
const BASE_URL = "http://localhost:8080";

// 🔁 Refresh Token Function
async function refreshToken() {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/refresh-token`, {
      method: "POST",
      credentials: "include", // required for cookie
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();

    // store new access token
    localStorage.setItem("token", data.accessToken);

    return data.accessToken;
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    return null;
  }
}

// 🌐 Main API Wrapper
export async function apiFetch(url, options = {}) {
  let token = localStorage.getItem("token");

  let response = await fetch(BASE_URL + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
    credentials: "include", // 🔥 must for cookies
  });

  // 🔐 If token expired → try refresh ONCE
  if (response.status === 401 && !options._retry) {
    const newToken = await refreshToken();

    if (newToken) {
      // retry original request with new token
      response = await fetch(BASE_URL + url, {
        ...options,
        _retry: true, // 🔥 prevent infinite loop
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
        },
        credentials: "include",
      });
    } else {
      // ❌ refresh failed → logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
      return;
    }
  }

  return response;
}
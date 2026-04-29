
const BASE_URL = "http://localhost:8080";

// 🔁 refresh token function
async function refreshToken() {
  try {
    const res = await fetch(`${BASE_URL}/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Refresh failed");

    const data = await res.json();
    localStorage.setItem("token", data.accessToken);

    return data.accessToken;
  } catch {
    return null;
  }
}

// 🌐 main fetch wrapper
export async function apiFetch(url, options = {}) {
  let token = localStorage.getItem("token");

  let res = await fetch(BASE_URL + url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
    credentials: "include",
  });

  // 🔐 if token expired
  if (res.status === 401) {
    const newToken = await refreshToken();

    if (newToken) {
      res = await fetch(BASE_URL + url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
        },
        credentials: "include",
      });
    } else {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }

  return res;
}
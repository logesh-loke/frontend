// src/Services/Api.js

import Swal from "sweetalert2";

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

    // Server Busy
    if (res.status === 429) {

      Swal.fire({
        icon: "warning",
        title: "Server Busy",
        text: "Too many requests. Please try again later.",
      });

      return null;
    }

    // Unauthorized
    if (res.status === 401) {
      return null;
    }

    // Other Errors
    if (!res.ok) {

      Swal.fire({
        icon: "error",
        title: "Refresh Failed",
        text: "Unable to refresh token.",
      });

      return null;
    }

    const data = await res.json();

    if (!data?.accessToken) {

      Swal.fire({
        icon: "error",
        title: "Token Error",
        text: "No access token received.",
      });

      return null;
    }

    // Save Token
    localStorage.setItem("token", data.accessToken);

    return data.accessToken;

  } catch (error) {

    console.error("Refresh token error:", error);

    Swal.fire({
      icon: "error",
      title: "Network Error",
      text: "Check your internet connection.",
    });

    return null;
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

  Swal.fire({
    icon: "info",
    title: "Session Expired",
    text: "Please login again.",
    timer: 2000,
    showConfirmButton: false,
  });

  setTimeout(() => {
    window.location.href = "/login";
  }, 2000);
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
    // Handle Rate Limit
    // ==========================
    if (response.status === 429) {

      Swal.fire({
        icon: "warning",
        title: "Server Busy",
        text: "Too many requests. Please wait and try again.",
      });

      return response;
    }

    // ==========================
    // Token Expired
    // ==========================
    if (response.status === 401 && !retry) {

      console.warn("Token expired, refreshing...");

      const newToken = await refreshToken();

      // Refresh Success
      if (newToken) {

        headers.Authorization = `Bearer ${newToken}`;

        response = await fetch(BASE_URL + url, {
          ...options,
          headers,
          credentials: "include",
        });

        return response;
      }

      // Refresh Failed
      await logoutUser();

      return;
    }

    return response;

  } catch (err) {

    console.error("API FETCH ERROR:", err);

    Swal.fire({
      icon: "error",
      title: "Something Went Wrong",
      text: "Please try again later.",
    });

    throw err;
  }
}
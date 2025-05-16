export async function refreshAccessToken() {
  try {
    const response = await fetch("/api/auth/refresh-token", {
      method: "POST",
      credentials: "include", // Important: send cookies
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      // If response is not ok, clear local storage and throw error
      localStorage.removeItem("token");
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    
    if (data.success && data.accessToken) {
      localStorage.setItem("token", data.accessToken);
      return data.accessToken;
    } else {
      localStorage.removeItem("token");
      throw new Error("Invalid token response");
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    localStorage.removeItem("token"); // Clear token on error
    window.location.href = "/login"; // Redirect to login page
    throw error;
  }
}

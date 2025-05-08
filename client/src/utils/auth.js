export async function refreshAccessToken() {
  try {
    const response = await fetch("http://localhost:5000/api/user/refresh-token", {
      method: "POST",
      credentials: "include", // Important: send cookies
      headers: {
        "Accept": "application/json"
      }
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.accessToken);
      return data.accessToken;
    } else {
      throw new Error(data.message || "Failed to refresh token");
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    throw error;
  }
}

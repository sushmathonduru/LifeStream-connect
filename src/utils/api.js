const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("jwt_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }
  
  return data;
};

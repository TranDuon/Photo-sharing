import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

export function extractApiError(err) {
  if (err.response?.data) {
    const d = err.response.data;
    if (typeof d === "string") return d;
    if (d.message) return d.message;
    if (d.error) return d.error;
  }
  if (err.request) {
    return `Lỗi mạng: không thể kết nối tới máy chủ. Hãy chắc backend đang chạy tại ${BASE_URL}`;
  }
  return err.message || "Lỗi không xác định.";
}

function fetchModel(url) {
  return apiClient
    .get(url)
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(extractApiError(err));
    });
}

export default fetchModel;

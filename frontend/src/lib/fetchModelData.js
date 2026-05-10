import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

/**
 * Axios instance dùng chung cho toàn bộ app.
 * Được export để các component có thể dùng trực tiếp
 * cho POST / multipart request.
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/**
 * setAuthToken
 *
 * Gọi sau khi login thành công để gắn JWT vào mọi request tiếp theo.
 * Gọi với null / undefined khi logout để xoá token.
 *
 * @param {string|null} token
 */
export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
}

/**
 * Helper: trích xuất message lỗi từ axios error object.
 */
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

/**
 * fetchModel
 *
 * Gửi HTTP GET, trả về Promise resolve với data hoặc reject với Error.
 *
 * @param   {string}  url   Ví dụ: "/user/list", `/user/${id}`
 * @returns {Promise<any>}
 */
function fetchModel(url) {
  return apiClient
    .get(url)
    .then((res) => res.data)
    .catch((err) => {
      throw new Error(extractApiError(err));
    });
}

export default fetchModel;

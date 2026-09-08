const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// NAD Admissions backend (admissions-server) — prod points at the NAD Railway API.
const NAD_API_BASE_URL =
  import.meta.env.VITE_NAD_API_BASE_URL || "http://localhost:8083";

function cleanPath(path: string): string {
  return path.replace(/\/\?/, "?").replace(/\/+$/, "");
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Expected JSON but got HTML (status ${response.status})`);
  }
  if (!response.ok) {
    const message = data?.error || data?.detail || data?.message || "Request failed";
    throw new Error(message);
  }
  if (data && typeof data === "object" && "data" in data && "status" in data) {
    return data.data as T;
  }
  return data;
}

export async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${cleanPath(path)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return handleResponse<T>(response);
}

// NAD Admissions Dashboard backend (admissions-server) — direct call to NAD API
export async function getNad<T>(path: string): Promise<T> {
  const response = await fetch(`${NAD_API_BASE_URL}/api${cleanPath(path)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<T>(response);
}

export async function post<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${cleanPath(path)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<T>(response);
}

export async function put<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${cleanPath(path)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<T>(response);
}

export async function patch<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${cleanPath(path)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<T>(response);
}

export async function del<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${cleanPath(path)}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return handleResponse<T>(response);
}

export async function uploadFile(path: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/api${cleanPath(path)}`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse<{ url: string }>(response);
}

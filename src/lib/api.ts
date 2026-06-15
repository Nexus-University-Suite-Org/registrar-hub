const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

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
    const message = data?.error || data?.detail || "Request failed";
    throw new Error(message);
  }
  return data;
}

export async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<T>(response);
}

export async function post<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<T>(response);
}

export async function put<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<T>(response);
}

export async function del<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}/api${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<T>(response);
}

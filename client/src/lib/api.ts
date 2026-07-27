import type { ImportCardsResult } from "../types/import";

const defaultHeaders = { "Content-Type": "application/json" };

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string }).error ?? "Request failed";
    throw new Error(message);
  }
  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "include" });
  return handleResponse<T>(res);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PUT",
    credentials: "include",
    headers: defaultHeaders,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PATCH",
    credentials: "include",
    headers: defaultHeaders,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse<T>(res);
}

export async function apiUpload(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return handleResponse<{ url: string }>(res);
}

export async function apiImportCsv(file: File): Promise<ImportCardsResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/cards/import", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const payload = data as { error?: string } & Partial<ImportCardsResult>;
    if (payload.results) {
      return payload as ImportCardsResult;
    }
    throw new Error(payload.error ?? "Import failed");
  }
  return data as ImportCardsResult;
}

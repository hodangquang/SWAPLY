import { ExchangeDto, Exchange } from "@/types";

const getBaseUrl = () => `${(import.meta as any).env?.VITE_API_URL || "http://localhost:5191/api"}`;

const getAuthToken = (): string | null => {
  try {
    const data = localStorage.getItem("swaply_current_user");
    if (!data) return null;
    const user = JSON.parse(data);
    return user.token || null;
  } catch {
    return null;
  }
};

const buildAuthHeaders = (extra: Record<string, string> = {}) => {
  const token = getAuthToken();
  return {
    accept: "*/*",
    ...(token
      ? {
          Authorization: token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`,
        }
      : {}),
    ...extra,
  };
};

export async function createExchange(dto: ExchangeDto): Promise<Exchange> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
  }

  const response = await fetch(`${getBaseUrl()}/Exchanges`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Gửi đề xuất trao đổi thất bại.";
    throw new Error(errMsg);
  }

  return await response.json();
}

export async function fetchExchanges(): Promise<Exchange[]> {
  const token = getAuthToken();
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${getBaseUrl()}/Exchanges/my`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json().catch(() => null);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error fetching exchanges:", e);
    return [];
  }
}

export async function cancelExchange(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
  }

  const response = await fetch(`${getBaseUrl()}/Exchanges/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Hủy đề xuất trao đổi thất bại.";
    throw new Error(errMsg);
  }
}

export async function fetchExchangeById(id: string): Promise<Exchange | null> {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/Exchanges/${encodeURIComponent(id)}`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json().catch(() => null);
  } catch (e) {
    console.error(`Error fetching exchange with id ${id}:`, e);
    return null;
  }
}

export async function fetchIncomingExchanges(): Promise<Exchange[]> {
  const token = getAuthToken();
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${getBaseUrl()}/Exchanges/my/incoming`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json().catch(() => null);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error fetching incoming exchanges:", e);
    return [];
  }
}

export async function acceptExchange(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
  }

  const response = await fetch(`${getBaseUrl()}/Exchanges/${encodeURIComponent(id)}/accept`, {
    method: "PUT",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || "Chấp nhận trao đổi thất bại.";
    throw new Error(errMsg);
  }
}

export async function rejectExchange(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
  }

  const response = await fetch(`${getBaseUrl()}/Exchanges/${encodeURIComponent(id)}/reject`, {
    method: "PUT",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || "Từ chối trao đổi thất bại.";
    throw new Error(errMsg);
  }
}

export async function cancelExchangeRequest(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
  }

  const response = await fetch(`${getBaseUrl()}/Exchanges/${encodeURIComponent(id)}/cancel`, {
    method: "PUT",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || "Hủy trao đổi thất bại.";
    throw new Error(errMsg);
  }
}

export async function completeExchange(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
  }

  const response = await fetch(`${getBaseUrl()}/Exchanges/${encodeURIComponent(id)}/complete`, {
    method: "PUT",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || "Hoàn tất trao đổi thất bại.";
    throw new Error(errMsg);
  }
}

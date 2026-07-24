const getBaseUrl = () =>
  `${(import.meta as any).env?.VITE_API_URL || "http://localhost:5191/api"}`;

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
          Authorization: token.toLowerCase().startsWith("bearer ")
            ? token
            : `Bearer ${token}`,
        }
      : {}),
    ...extra,
  };
};

export interface AdminBoostPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  boostCount: number;
  durationDays: number;
  isActive: boolean;
  createdAt?: string;
}

export interface AdminBoostPackagePayload {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  boostCount: number;
  durationDays: number;
  isActive?: boolean;
}

// GET /api/admin/boost-packages – Danh sách gói đẩy tin
export async function fetchAdminBoostPackages(): Promise<AdminBoostPackage[]> {
  const response = await fetch(`${getBaseUrl()}/admin/boost-packages`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Bạn cần đăng nhập Admin để xem danh sách gói đẩy tin.");
    }
    throw new Error("Không thể tải danh sách gói đẩy tin.");
  }

  const data = await response.json().catch(() => null);
  return Array.isArray(data) ? data : data?.items || [];
}

// POST /api/admin/boost-packages – Tạo gói mới
export async function createAdminBoostPackage(
  payload: AdminBoostPackagePayload
): Promise<AdminBoostPackage> {
  const response = await fetch(`${getBaseUrl()}/admin/boost-packages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg =
      errData.error || errData.message || errData.title || "Tạo gói đẩy tin thất bại.";
    throw new Error(errMsg);
  }

  return await response.json();
}

// GET /api/admin/boost-packages/{id} – Xem chi tiết gói
export async function fetchAdminBoostPackageById(
  id: string
): Promise<AdminBoostPackage | null> {
  const response = await fetch(
    `${getBaseUrl()}/admin/boost-packages/${encodeURIComponent(id)}`,
    {
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Không thể tải chi tiết gói đẩy tin.");
  }

  return await response.json().catch(() => null);
}

// PUT /api/admin/boost-packages/{id} – Cập nhật gói
export async function updateAdminBoostPackage(
  id: string,
  payload: AdminBoostPackagePayload
): Promise<AdminBoostPackage> {
  const response = await fetch(
    `${getBaseUrl()}/admin/boost-packages/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(),
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg =
      errData.error || errData.message || errData.title || "Cập nhật gói đẩy tin thất bại.";
    throw new Error(errMsg);
  }

  return await response.json();
}

// DELETE /api/admin/boost-packages/{id} – Xóa gói
export async function deleteAdminBoostPackage(id: string): Promise<void> {
  const response = await fetch(
    `${getBaseUrl()}/admin/boost-packages/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg =
      errData.error || errData.message || errData.title || "Xóa gói đẩy tin thất bại.";
    throw new Error(errMsg);
  }
}

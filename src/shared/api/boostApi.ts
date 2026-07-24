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

export interface BoostPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  boostCount: number;
  durationDays: number;
  isActive: boolean;
}

export interface BoostQuota {
  remainingBoosts: number;
  totalBoosts: number;
  packageName?: string;
  expiresAt?: string;
}

export interface ActiveBoost {
  id: string;
  packageId: string;
  packageName: string;
  remainingBoosts: number;
  totalBoosts: number;
  activatedAt: string;
  expiresAt: string;
}

// GET /api/boost/packages – Xem danh sách các gói đẩy tin
export async function fetchBoostPackages(): Promise<BoostPackage[]> {
  try {
    const response = await fetch(`${getBaseUrl()}/boost/packages`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) return [];

    const data = await response.json().catch(() => null);
    return Array.isArray(data) ? data : data?.items || [];
  } catch (e) {
    console.error("Error fetching boost packages:", e);
    return [];
  }
}

// GET /api/boost/quota – Kiểm tra số lượt đẩy tin còn lại
export async function fetchBoostQuota(): Promise<BoostQuota> {
  const token = getAuthToken();
  if (!token) return { remainingBoosts: 0, totalBoosts: 0 };

  try {
    const response = await fetch(`${getBaseUrl()}/boost/quota`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) return { remainingBoosts: 0, totalBoosts: 0 };

    const data = await response.json().catch(() => null);
    return {
      remainingBoosts: data?.remainingBoosts ?? data?.remaining ?? 0,
      totalBoosts: data?.totalBoosts ?? data?.total ?? 0,
      packageName: data?.packageName || "",
      expiresAt: data?.expiresAt || "",
    };
  } catch (e) {
    console.error("Error fetching boost quota:", e);
    return { remainingBoosts: 0, totalBoosts: 0 };
  }
}

// POST /api/boost/subscribe/{packageId} – Đăng ký gói đẩy tin
export async function subscribeBoostPackage(packageId: string): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("Vui lòng đăng nhập để đăng ký gói đẩy tin.");

  const response = await fetch(
    `${getBaseUrl()}/boost/subscribe/${encodeURIComponent(packageId)}`,
    {
      method: "POST",
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg =
      errData.error || errData.message || "Đăng ký gói đẩy tin thất bại.";
    throw new Error(errMsg);
  }
}

// GET /api/boost/current – Xem thông tin gói đẩy tin đang kích hoạt
export async function fetchCurrentBoost(): Promise<ActiveBoost | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(`${getBaseUrl()}/boost/current`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) return null;

    return await response.json().catch(() => null);
  } catch (e) {
    console.error("Error fetching current boost:", e);
    return null;
  }
}

// DELETE /api/boost/cancel – Hủy gói đẩy tin đang dùng
export async function cancelBoostSubscription(): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");

  const response = await fetch(`${getBaseUrl()}/boost/cancel`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg =
      errData.error || errData.message || "Hủy gói đẩy tin thất bại.";
    throw new Error(errMsg);
  }
}

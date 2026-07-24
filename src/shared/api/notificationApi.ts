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

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
}

// GET /api/Notifications – Lấy danh sách tất cả thông báo
export async function fetchNotifications(): Promise<Notification[]> {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(`${getBaseUrl()}/Notifications`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) return [];

    const data = await response.json().catch(() => null);
    return Array.isArray(data) ? data : data?.items || [];
  } catch (e) {
    console.error("Error fetching notifications:", e);
    return [];
  }
}

// GET /api/Notifications/unread – Lấy danh sách thông báo chưa đọc
export async function fetchUnreadNotifications(): Promise<Notification[]> {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(`${getBaseUrl()}/Notifications/unread`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) return [];

    const data = await response.json().catch(() => null);
    return Array.isArray(data) ? data : data?.items || [];
  } catch (e) {
    console.error("Error fetching unread notifications:", e);
    return [];
  }
}

// GET /api/Notifications/unread-count – Đếm số lượng thông báo chưa đọc
export async function fetchUnreadNotificationCount(): Promise<number> {
  const token = getAuthToken();
  if (!token) return 0;

  try {
    const response = await fetch(`${getBaseUrl()}/Notifications/unread-count`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) return 0;

    const data = await response.json().catch(() => null);
    if (typeof data === "number") return data;
    return data?.count ?? data?.unreadCount ?? 0;
  } catch (e) {
    console.error("Error fetching unread notification count:", e);
    return 0;
  }
}

// PUT /api/Notifications/{id}/read – Đánh dấu một thông báo là đã đọc
export async function markNotificationRead(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("Bạn vui lòng đăng nhập tài khoản để cập nhật trạng thái thông báo nhé.");

  const response = await fetch(
    `${getBaseUrl()}/Notifications/${encodeURIComponent(id)}/read`,
    {
      method: "PUT",
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg =
      errData.error || errData.message || "Đánh dấu thông báo thất bại.";
    throw new Error(errMsg);
  }
}

// PUT /api/Notifications/read-all – Đánh dấu tất cả thông báo đã đọc
export async function markAllNotificationsRead(): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("Bạn vui lòng đăng nhập tài khoản để có thể đánh dấu đọc tất cả thông báo nhé.");

  const response = await fetch(`${getBaseUrl()}/Notifications/read-all`, {
    method: "PUT",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg =
      errData.error ||
      errData.message ||
      "Đánh dấu tất cả thông báo thất bại.";
    throw new Error(errMsg);
  }
}

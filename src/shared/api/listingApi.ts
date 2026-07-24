import { Property } from "@/types";

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

const mapProperty = (item: any, index: number): Property => ({
  id: item.id || item.listingId || item.propertyId || `prop-${index}`,

  // API fields
  title: item.title || item.name || "Sản phẩm đổi đồ",
  description: item.description || "Mô tả sản phẩm chưa được cập nhật.",
  ownerId: item.userId || item.ownerId || item.user?.id || "",
  ownerName: item.ownerName || item.hostName || item.user?.fullName || item.user?.username || "Thành viên Swaply",
  ownerAvatar: item.ownerAvatar || item.hostAvatar || item.user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
  categoryId: item.categoryId || item.category?.id || "00000000-0000-0000-0000-000000000000",
  categoryName: item.categoryName || item.category?.name || "Danh mục khác",
  estimatedValue: item.estimatedValue || item.estimatedAmount || item.price || 0,
  currency: item.currency || "VND",
  condition: item.condition || item.conditionName || "Good",
  conditionName: item.conditionName || item.condition || "Good",
  status: item.status || "Active",
  brand: item.brand || "",
  exchangeWish: item.exchangeWish || "",
  cashTopUpAmount: item.cashTopUpAmount || 0,
  cashTopUpCurrency: item.cashTopUpCurrency || "VND",
  location: item.location || "Hồ Chí Minh",
  viewCount: item.viewCount || 0,
  favoriteCount: item.favoriteCount || 0,
  images: (() => {
    // API returns imageUrls
    if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
      return item.imageUrls;
    }
    if (Array.isArray(item.images) && item.images.length > 0) {
      return item.images.map((img: any) => {
        if (typeof img === "string") return img;
        return img.imageUrl || img.image || "";
      }).filter(Boolean);
    }
    if (item.primaryImageUrl) {
      return [item.primaryImageUrl];
    }
    if (typeof item.imageUrl === "string" && item.imageUrl) {
      return [item.imageUrl];
    }
    if (typeof item.images === "string" && item.images) {
      return [item.images];
    }
    return [];
  })(),
  createdAt: item.createdAt || new Date().toISOString(),
  updatedAt: item.updatedAt || new Date().toISOString(),
  expiresAt: item.expiresAt || "",
  rejectionReason: item.rejectionReason || null,

  // Legacy/compatible fields
  hostType: item.hostType || "Chủ sở hữu",
  price: item.estimatedValue || item.estimatedAmount || item.price || 0,
  rating: item.rating !== undefined ? item.rating : 5.0,
  reviewsCount: item.reviewsCount || 0,
  amenities: Array.isArray(item.amenities) ? item.amenities : ["Mới 99%", "Chính hãng", "Đầy đủ phụ kiện"],
  isGuestFavorite: item.isGuestFavorite !== undefined ? item.isGuestFavorite : false,
  maxGuests: item.maxGuests || 1,
  isExperience: false,
  dateRange: item.dateRange || "Hôm nay",
  category: item.categoryName || item.category || "Danh mục khác",
});

export async function fetchProperties(): Promise<Property[]> {
  try {
    const response = await fetch(`${getBaseUrl()}/Listings?sortBy=newest&page=1&pageSize=100`, {
      headers: { accept: "*/*" },
    });

    if (!response.ok) {
      console.warn("Fetch backend properties failed.");
      return [];
    }

    const data = await response.json().catch(() => null);
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];

    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    return items.map((item: any, index: number) => mapProperty(item, index));
  } catch (e) {
    console.error("Error fetching properties from backend:", e);
    return [];
  }
}

export async function fetchListingById(id: string): Promise<Property | null> {
  const response = await fetch(`${getBaseUrl()}/Listings/${encodeURIComponent(id)}`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Rất tiếc, hệ thống không thể tải thông tin chi tiết của tin đăng này. Bạn vui lòng tải lại trang hoặc thử lại sau nhé!");
  }

  const data = await response.json().catch(() => null);
  return data ? mapProperty(data, 0) : null;
}

export async function fetchPendingListings(): Promise<Property[]> {
  const response = await fetch(`${getBaseUrl()}/admin/listings/pending`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Tài khoản của bạn cần có quyền Quản trị viên để xem danh sách tin đăng chờ duyệt.");
    }
    throw new Error("Rất tiếc, hệ thống không thể tải danh sách tin đăng đang chờ duyệt lúc này. Bạn vui lòng thử lại sau.");
  }

  const data = await response.json().catch(() => null);
  const items = Array.isArray(data) ? data : data?.items || data?.listings || [];

  return (Array.isArray(items) ? items : []).map((item: any, index: number) => ({
    ...mapProperty(item, index),
    status: item.status || "Pending",
  }));
}

export async function createProperty(prop: Property): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Bạn vui lòng đăng nhập tài khoản để có thể đăng bài trao đổi sản phẩm nhé.");
  }

  const formData = new FormData();
  formData.append("title", prop.title);
  formData.append("description", prop.description || "Mô tả sản phẩm");
  formData.append("categoryId", prop.categoryId || "00000000-0000-0000-0000-000000000000");
  formData.append("estimatedAmount", String(prop.estimatedValue || prop.price || 0));
  formData.append("currency", "VND");
  formData.append("condition", prop.condition || "New");
  formData.append("brand", prop.brand || "");
  formData.append("exchangeWish", prop.exchangeWish || "");
  formData.append("cashTopUpAmount", String(prop.cashTopUpAmount || 0));
  formData.append("location", prop.location || "Hồ Chí Minh");

  if (Array.isArray(prop.imageFiles) && prop.imageFiles.length > 0) {
    for (const file of prop.imageFiles) {
      formData.append("images", file);
    }
  }

  const response = await fetch(`${getBaseUrl()}/Listings`, {
    method: "POST",
    headers: {
      accept: "*/*",
      Authorization: token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Đăng bài trao đổi thất bại.";
    throw new Error(errMsg);
  }

  const createdData = await response.json().catch(() => null);
  const createdId = createdData?.id || createdData?.listingId || createdData?.propertyId;

  if (createdId) {
    await submitListing(createdId);
  }
}

export async function submitListing(id: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/Listings/${encodeURIComponent(id)}/submit`, {
    method: "POST",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Gửi bài đăng thất bại.";
    throw new Error(errMsg);
  }
}

export async function deleteProperty(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Bạn vui lòng đăng nhập tài khoản để có thể xóa tin đăng của mình.");
  }

  const response = await fetch(`${getBaseUrl()}/Listings/${id}`, {
    method: "DELETE",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Rất tiếc, quá trình xóa tin đăng của bạn đã gặp lỗi. Vui lòng thử lại.");
  }
}

export async function updatePropertyStatus(id: string, status: Property["status"]): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/Listings/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(status),
  });

  if (!response.ok) {
    const patchRes = await fetch(`${getBaseUrl()}/Listings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json-patch+json",
        ...buildAuthHeaders(),
      },
      body: JSON.stringify([{ op: "replace", path: "/status", value: status }]),
    });

    if (!patchRes.ok) {
      throw new Error("Rất tiếc, hệ thống gặp lỗi khi cập nhật trạng thái tin đăng. Bạn vui lòng thử lại.");
    }
  }
}

export async function approveListing(id: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/admin/listings/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Duyệt tin đăng thất bại.";
    throw new Error(errMsg);
  }
}

export async function rejectListing(id: string, reason?: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/admin/listings/${encodeURIComponent(id)}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({ reason: reason || "Không phù hợp với quy định." }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Từ chối tin đăng thất bại.";
    throw new Error(errMsg);
  }
}

export async function fetchMyListings(): Promise<Property[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Bạn vui lòng đăng nhập tài khoản để xem danh sách tin đăng của mình nhé.");
  }

  const response = await fetch(`${getBaseUrl()}/Listings/my`, {
    method: "GET",
    headers: {
      accept: "*/*",
      Authorization: token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Rất tiếc, hệ thống chưa thể tải danh sách tin đăng của bạn lúc này. Bạn vui lòng thử lại sau.");
  }

  const data = await response.json().catch(() => null);
  const items = Array.isArray(data) ? data : data?.items || [];

  return (Array.isArray(items) ? items : []).map((item: any, index: number) => ({
    ...mapProperty(item, index),
    // API returns images as objects with imageUrl field
    images: Array.isArray(item.images)
      ? item.images.map((img: any) => typeof img === "string" ? img : img.imageUrl || "")
        .filter(Boolean)
      : [],
    // Additional API fields
    ownerAvatar: item.ownerAvatar || "",
    viewCount: item.viewCount || 0,
    favoriteCount: item.favoriteCount || 0,
    expiresAt: item.expiresAt || "",
    rejectionReason: item.rejectionReason || null,
  }));
}

export interface UpdateListingPayload {
  title?: string;
  description?: string;
  categoryId?: string;
  estimatedAmount?: number;
  currency?: string;
  condition?: string;
  brand?: string;
  exchangeWish?: string;
  cashTopUpAmount?: number;
  location?: string;
}

export async function updateListing(id: string, payload: UpdateListingPayload): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Bạn vui lòng đăng nhập tài khoản để cập nhật thông tin tin đăng nhé.");
  }

  const response = await fetch(`${getBaseUrl()}/Listings/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Cập nhật tin đăng thất bại.";
    throw new Error(errMsg);
  }
}

export interface FavoriteResult {
  listingId: string;
  isFavorited: boolean;
  favoriteCount: number;
}

export async function toggleFavorite(listingId: string): Promise<FavoriteResult> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Bạn vui lòng đăng nhập để có thể lưu bài viết này vào danh sách yêu thích nhé.");
  }

  const response = await fetch(`${getBaseUrl()}/Listings/${encodeURIComponent(listingId)}/favorite`, {
    method: "POST",
    headers: {
      accept: "*/*",
      Authorization: token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Rất tiếc, thao tác cập nhật trạng thái yêu thích gặp lỗi. Bạn vui lòng thử lại.");
  }

  return response.json();
}

export async function renewListing(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Bạn vui lòng đăng nhập tài khoản để có thể gia hạn tin đăng này.");
  }

  const response = await fetch(`${getBaseUrl()}/Listings/${encodeURIComponent(id)}/renew`, {
    method: "POST",
    headers: {
      accept: "*/*",
      Authorization: token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || "Rất tiếc, hệ thống chỉ hỗ trợ gia hạn đối với những tin đăng đã hết hạn hiển thị.";
    throw new Error(errMsg);
  }
}

export async function fetchMyFavorites(): Promise<Property[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Bạn vui lòng đăng nhập tài khoản để xem danh sách sản phẩm yêu thích nhé.");
  }

  const response = await fetch(`${getBaseUrl()}/Listings/my/favorites`, {
    method: "GET",
    headers: {
      accept: "*/*",
      Authorization: token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể kết nối đến máy chủ để tải danh sách yêu thích. Vui lòng thử lại sau.");
  }

  const data = await response.json().catch(() => null);
  const items = Array.isArray(data) ? data : data?.items || [];
  return items.map((item: any, index: number) => mapProperty(item, index));
}

export async function fetchAdminUsers(keyword: string = "", page: number = 1, pageSize: number = 100): Promise<any[]> {
  const queryParams = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (keyword) {
    queryParams.append("keyword", keyword);
  }

  const response = await fetch(`${getBaseUrl()}/admin/users?${queryParams.toString()}`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Yêu cầu quyền Quản trị viên để truy cập danh sách thành viên.");
    }
    throw new Error("Hệ thống chưa thể tải danh sách thành viên lúc này. Vui lòng thử lại sau.");
  }

  const data = await response.json().catch(() => null);
  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : [];

  return items.map((user: any) => ({
    id: user.id || user.userId || "",
    name: user.fullName || user.name || user.username || "Thành viên Swaply",
    username: user.username || "",
    email: user.email || "",
    phone: user.phoneNumber || user.phone || "N/A",
    role: user.roleName || user.role || "User",
    status: user.status || (user.isBlocked ? "Blocked" : "Active"),
    verification: user.isVerified || user.verification === "Verified" ? "Verified" : "Unverified",
    createdAt: user.createdAt ? user.createdAt.split("T")[0] : "2026-07-23",
  }));
}

export async function fetchAdminUserById(id: string): Promise<any | null> {
  const response = await fetch(`${getBaseUrl()}/admin/users/${encodeURIComponent(id)}`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Không thể tìm thấy hoặc tải thông tin chi tiết thành viên này.");
  }

  const user = await response.json().catch(() => null);
  if (!user) return null;

  return {
    id: user.id || user.userId || "",
    name: user.fullName || user.name || user.username || "Thành viên Swaply",
    username: user.username || "",
    email: user.email || "",
    phone: user.phoneNumber || user.phone || "N/A",
    role: user.roleName || user.role || "User",
    status: user.status || (user.isBlocked ? "Blocked" : "Active"),
    verification: user.isVerified || user.verification === "Verified" ? "Verified" : "Unverified",
    createdAt: user.createdAt ? user.createdAt.split("T")[0] : "2026-07-23",
  };
}

export async function lockUser(id: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/admin/users/${encodeURIComponent(id)}/lock`, {
    method: "PUT",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Thao tác khóa tài khoản không thành công. Vui lòng thử lại.");
  }
}

export async function unlockUser(id: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/admin/users/${encodeURIComponent(id)}/unlock`, {
    method: "PUT",
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Thao tác mở khóa tài khoản không thành công. Vui lòng thử lại.");
  }
}

export async function reportUser(targetId: string, reason: string, description: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Bạn vui lòng đăng nhập để gửi báo cáo vi phạm nhé.");
  }

  const response = await fetch(`${getBaseUrl()}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      Authorization: token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`,
    },
    body: JSON.stringify({
      targetType: "User",
      targetId,
      reason,
      description,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.message || errData.error || "Gửi báo cáo người dùng thất bại.";
    throw new Error(errMsg);
  }
}

export async function fetchAdminReports(page: number = 1, pageSize: number = 100): Promise<any[]> {
  const response = await fetch(`${getBaseUrl()}/admin/reports?page=${page}&pageSize=${pageSize}`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Yêu cầu quyền Quản trị viên để xem danh sách báo cáo vi phạm.");
    }
    throw new Error("Không thể tải danh sách báo cáo vi phạm vào lúc này. Vui lòng thử lại.");
  }

  const data = await response.json().catch(() => null);
  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : [];

  return items.map((rep: any) => ({
    id: rep.id || rep.reportId || `rep-${Math.random()}`,
    targetType: rep.targetType || "User",
    targetId: rep.targetId || "",
    reason: rep.reason || "Spam",
    description: rep.description || "Không có nội dung mô tả.",
    reporterName: rep.reporterName || rep.ReporterName || rep.reporter?.fullName || rep.reporter?.username || "Thành viên",
    targetName: rep.targetName || rep.TargetName || rep.targetUser?.fullName || rep.targetUser?.username || rep.targetId || "Đối tượng",
    createdAt: rep.createdAt ? rep.createdAt.split("T")[0] : "2026-07-23",
  }));
}

// GET /api/Listings/my/{status} – Lọc bài đăng cá nhân theo trạng thái
export async function fetchMyListingsByStatus(status: string): Promise<Property[]> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Bạn vui lòng đăng nhập tài khoản để xem danh sách tin đăng của mình.");
  }

  const response = await fetch(
    `${getBaseUrl()}/Listings/my/${encodeURIComponent(status)}`,
    {
      method: "GET",
      headers: {
        accept: "*/*",
        Authorization: token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Rất tiếc, hệ thống không thể tải danh sách tin đăng theo bộ lọc trạng thái lúc này.");
  }

  const data = await response.json().catch(() => null);
  const items = Array.isArray(data) ? data : data?.items || [];

  return (Array.isArray(items) ? items : []).map((item: any, index: number) => ({
    ...mapProperty(item, index),
    images: Array.isArray(item.images)
      ? item.images.map((img: any) => typeof img === "string" ? img : img.imageUrl || "").filter(Boolean)
      : [],
    expiresAt: item.expiresAt || "",
    rejectionReason: item.rejectionReason || null,
  }));
}

// GET /api/Listings/category/{categoryId} – Lấy bài đăng theo danh mục
export async function fetchListingsByCategory(categoryId: string): Promise<Property[]> {
  try {
    const response = await fetch(
      `${getBaseUrl()}/Listings/category/${encodeURIComponent(categoryId)}`,
      {
        headers: { accept: "*/*" },
      }
    );

    if (!response.ok) return [];

    const data = await response.json().catch(() => null);
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

    return items.map((item: any, index: number) => mapProperty(item, index));
  } catch (e) {
    console.error("Error fetching listings by category:", e);
    return [];
  }
}

// GET /api/admin/listings – Xem toàn bộ bài đăng trong hệ thống
export async function fetchAdminAllListings(
  page: number = 1,
  pageSize: number = 100
): Promise<Property[]> {
  const response = await fetch(
    `${getBaseUrl()}/admin/listings?page=${page}&pageSize=${pageSize}`,
    {
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Yêu cầu quyền Quản trị viên để xem danh sách tất cả bài viết.");
    }
    throw new Error("Không thể tải danh sách bài đăng từ máy chủ. Vui lòng thử lại sau.");
  }

  const data = await response.json().catch(() => null);
  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : [];

  return items.map((item: any, index: number) => mapProperty(item, index));
}

// GET /api/admin/listings/{id} – Xem chi tiết bài đăng trong hệ thống dành cho Admin
export async function fetchAdminListingById(id: string): Promise<Property | null> {
  const response = await fetch(
    `${getBaseUrl()}/admin/listings/${encodeURIComponent(id)}`,
    {
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Không thể tải chi tiết bài đăng.");
  }

  const data = await response.json().catch(() => null);
  return data ? mapProperty(data, 0) : null;
}

// PUT /api/admin/listings/{id}/hide – Ẩn bài viết vi phạm
export async function hideListing(id: string): Promise<void> {
  const response = await fetch(
    `${getBaseUrl()}/admin/listings/${encodeURIComponent(id)}/hide`,
    {
      method: "PUT",
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Ẩn bài đăng thất bại.";
    throw new Error(errMsg);
  }
}

// PUT /api/admin/listings/{id}/restore – Khôi phục bài đăng bị ẩn/xóa
export async function restoreListing(id: string): Promise<void> {
  const response = await fetch(
    `${getBaseUrl()}/admin/listings/${encodeURIComponent(id)}/restore`,
    {
      method: "PUT",
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Khôi phục bài đăng thất bại.";
    throw new Error(errMsg);
  }
}

// GET /api/admin/listings/deleted – Xem danh sách bài đăng đã xóa
export async function fetchDeletedListings(
  page: number = 1,
  pageSize: number = 100
): Promise<Property[]> {
  const response = await fetch(
    `${getBaseUrl()}/admin/listings/deleted?page=${page}&pageSize=${pageSize}`,
    {
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Yêu cầu quyền Quản trị viên để xem các bài đăng đã xóa.");
    }
    throw new Error("Không thể tải danh sách bài đăng đã bị xóa lúc này.");
  }

  const data = await response.json().catch(() => null);
  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : [];

  return items.map((item: any, index: number) => mapProperty(item, index));
}

// DELETE /api/admin/listings/{id} – Xóa vĩnh viễn bài đăng
export async function permanentDeleteListing(id: string): Promise<void> {
  const response = await fetch(
    `${getBaseUrl()}/admin/listings/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Xóa vĩnh viễn bài đăng thất bại.";
    throw new Error(errMsg);
  }
}

// GET /api/admin/reports/pending – Xem danh sách báo cáo chưa xử lý
export async function fetchAdminPendingReports(): Promise<any[]> {
  const response = await fetch(`${getBaseUrl()}/admin/reports/pending`, {
    headers: buildAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Yêu cầu quyền Quản trị viên để xem danh sách báo cáo chưa xử lý.");
    }
    throw new Error("Không thể tải danh sách báo cáo chưa xử lý vào lúc này. Vui lòng tải lại.");
  }

  const data = await response.json().catch(() => null);
  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data)
      ? data
      : [];

  return items.map((rep: any) => ({
    id: rep.id || rep.reportId || `rep-${Math.random()}`,
    targetType: rep.targetType || "User",
    targetId: rep.targetId || "",
    reason: rep.reason || "Spam",
    description: rep.description || "",
    status: rep.status || "Pending",
    reporterName: rep.reporterName || rep.ReporterName || rep.reporter?.fullName || rep.reporter?.username || "Thành viên",
    targetName: rep.targetName || rep.TargetName || rep.targetUser?.fullName || rep.targetUser?.username || rep.targetId || "Đối tượng",
    createdAt: rep.createdAt ? rep.createdAt.split("T")[0] : "2026-07-23",
  }));
}

// GET /api/admin/reports/{id} – Xem thông tin chi tiết một báo cáo vi phạm
export async function fetchAdminReportById(id: string): Promise<any | null> {
  const response = await fetch(
    `${getBaseUrl()}/admin/reports/${encodeURIComponent(id)}`,
    {
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error("Rất tiếc, hệ thống không thể tải thông tin chi tiết của báo cáo này.");
  }

  const rep = await response.json().catch(() => null);
  if (!rep) return null;

  return {
    id: rep.id || rep.reportId || "",
    targetType: rep.targetType || "User",
    targetId: rep.targetId || "",
    reason: rep.reason || "",
    description: rep.description || "",
    status: rep.status || "Pending",
    reporterName: rep.reporterName || rep.ReporterName || rep.reporter?.fullName || rep.reporter?.username || "Thành viên",
    targetName: rep.targetName || rep.TargetName || rep.targetUser?.fullName || rep.targetUser?.username || rep.targetId || "Đối tượng",
    createdAt: rep.createdAt ? rep.createdAt.split("T")[0] : "2026-07-23",
  };
}

// PUT /api/admin/reports/{id}/approve – Chấp nhận báo cáo vi phạm (và xử lý)
export async function approveAdminReport(id: string, adminNote: string = "Đã duyệt báo cáo"): Promise<void> {
  const response = await fetch(
    `${getBaseUrl()}/admin/reports/${encodeURIComponent(id)}/approve`,
    {
      method: "PUT",
      headers: buildAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ adminNote }),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || "Chấp nhận báo cáo thất bại.";
    throw new Error(errMsg);
  }
}

// PUT /api/admin/reports/{id}/reject – Bác bỏ báo cáo vi phạm
export async function rejectAdminReport(id: string, adminNote: string = "Đã bác bỏ báo cáo"): Promise<void> {
  const response = await fetch(
    `${getBaseUrl()}/admin/reports/${encodeURIComponent(id)}/reject`,
    {
      method: "PUT",
      headers: buildAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ adminNote }),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || "Bác bỏ báo cáo thất bại.";
    throw new Error(errMsg);
  }
}

// GET /api/reports – Lấy danh sách báo cáo cá nhân đã gửi
export async function fetchMyReports(): Promise<any[]> {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(`${getBaseUrl()}/reports`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) return [];

    const data = await response.json().catch(() => null);
    return Array.isArray(data) ? data : data?.items || [];
  } catch (e) {
    console.error("Error fetching my reports:", e);
    return [];
  }
}

// GET /api/reports/{id} – Xem chi tiết một báo cáo
export async function fetchReportById(id: string): Promise<any | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(
      `${getBaseUrl()}/reports/${encodeURIComponent(id)}`,
      {
        headers: buildAuthHeaders(),
      }
    );

    if (!response.ok) return null;

    return await response.json().catch(() => null);
  } catch (e) {
    console.error(`Error fetching report ${id}:`, e);
    return null;
  }
}

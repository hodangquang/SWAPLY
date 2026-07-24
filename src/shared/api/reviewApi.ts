import { Review } from "@/types";

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

export async function getUserReviews(userId: string): Promise<Review[]> {
  try {
    const response = await fetch(`${getBaseUrl()}/users/${encodeURIComponent(userId)}/reviews`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json().catch(() => null);
    const items = Array.isArray(data) ? data : data?.items || [];

    return items.map((item: any, index: number): Review => ({
      id: item.id || `review-${index}`,
      author: item.reviewerName || item.author || "Người dùng",
      avatar: item.reviewerAvatar || item.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
      rating: item.rating || 5,
      content: item.content || item.comment || item.reviewContent || "Không có nội dung đánh giá.",
    }));
  } catch (e) {
    console.error("Error fetching user reviews:", e);
    return [];
  }
}

export async function getUserRating(userId: string): Promise<{ rating: number; count: number }> {
  try {
    const response = await fetch(`${getBaseUrl()}/users/${encodeURIComponent(userId)}/rating`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      return { rating: 0, count: 0 };
    }

    const data = await response.json().catch(() => null);
    return {
      rating: data?.rating || data?.averageRating || 0,
      count: data?.count || data?.reviewCount || 0,
    };
  } catch (e) {
    console.error("Error fetching user rating:", e);
    return { rating: 0, count: 0 };
  }
}

export async function createReview(userId: string, listingId: string, rating: number, content: string): Promise<Review> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Bạn vui lòng đăng nhập tài khoản để có thể gửi đánh giá nhé.");
  }

  const response = await fetch(`${getBaseUrl()}/Reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify({
      listingId,
      rating,
      content,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || "Gửi đánh giá thất bại.";
    throw new Error(errMsg);
  }

  return await response.json();
}

export interface CreateExchangeReviewDto {
  exchangeId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}

export async function createExchangeReview(dto: CreateExchangeReviewDto): Promise<any> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Bạn vui lòng đăng nhập tài khoản để có thể đánh giá giao dịch trao đổi nhé.");
  }

  const response = await fetch(`${getBaseUrl()}/Reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || "Gửi đánh giá thất bại.";
    throw new Error(errMsg);
  }

  return await response.json().catch(() => null);
}

export async function fetchReviewById(reviewId: string): Promise<Review> {
  const response = await fetch(`${getBaseUrl()}/Reviews/${encodeURIComponent(reviewId)}`, {
    method: "GET",
    headers: {
      "Accept": "*/*"
    }
  });

  if (!response.ok) {
    throw new Error("Rất tiếc, hệ thống chưa thể tải thông tin đánh giá lúc này. Bạn vui lòng thử lại sau.");
  }

  const item = await response.json();
  return {
    id: item.id || reviewId,
    author: item.reviewerName || item.author || "Người dùng",
    avatar: item.reviewerAvatar || item.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
    rating: item.rating || 0,
    content: item.content || item.comment || item.reviewContent || "Không có nội dung đánh giá."
  };
}

export async function fetchMyGivenReviews(): Promise<any[]> {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(`${getBaseUrl()}/Reviews/my/given`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json().catch(() => null);
    return Array.isArray(data) ? data : data?.items || [];
  } catch (e) {
    console.error("Error fetching my given reviews:", e);
    return [];
  }
}

export async function fetchMyReceivedReviews(): Promise<any[]> {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(`${getBaseUrl()}/Reviews/my/received`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json().catch(() => null);
    return Array.isArray(data) ? data : data?.items || [];
  } catch (e) {
    console.error("Error fetching my received reviews:", e);
    return [];
  }
}

import { Category } from "@/types";

const getBaseUrl = () => `${(import.meta as any).env?.VITE_API_URL || "http://localhost:5191/api"}`;

const getAuthToken = () => {
  try {
    const data = localStorage.getItem("swaply_current_user");
    if (!data) return null;
    const user = JSON.parse(data);
    return user.token || null;
  } catch {
    return null;
  }
};

const getAuthHeaders = (extra: Record<string, string> = {}) => {
  const token = getAuthToken();
  return {
    accept: "*/*",
    ...(token ? { Authorization: token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}` } : {}),
    ...extra
  };
};

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${getBaseUrl()}/Categories`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.id || `cat-${Date.now()}-${Math.random()}`,
      name: item.name || "Danh mục",
      description: item.description || ""
    }));
  } catch {
    return [];
  }
}

export async function createCategory(category: { name: string; description?: string }): Promise<Category> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
  }

  const response = await fetch(`${getBaseUrl()}/Categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({
      name: category.name,
      description: category.description || ""
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Tạo danh mục thất bại.";
    throw new Error(errMsg);
  }

  return await response.json().catch(() => ({
    id: "",
    name: category.name,
    description: category.description || ""
  }));
}

export async function fetchCategoryById(id: string): Promise<Category | null> {
  if (!id) {
    return null;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/Categories/${encodeURIComponent(id)}`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json().catch(() => null);
    if (!data || typeof data !== "object") {
      return null;
    }

    return {
      id: data.id || id,
      name: data.name || "Danh mục",
      description: data.description || ""
    };
  } catch {
    return null;
  }
}

export async function updateCategory(id: string, category: { name: string; description?: string }): Promise<Category> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
  }

  const response = await fetch(`${getBaseUrl()}/Categories/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({
      name: category.name,
      description: category.description || ""
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Cập nhật danh mục thất bại.";
    throw new Error(errMsg);
  }

  return await response.json().catch(() => ({
    id,
    name: category.name,
    description: category.description || ""
  }));
}

export async function deleteCategory(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
  }

  const response = await fetch(`${getBaseUrl()}/Categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || errData.message || errData.title || "Xóa danh mục thất bại.";
    throw new Error(errMsg);
  }
}

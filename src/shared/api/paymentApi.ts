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

export interface Payment {
  id: string;
  userId: string;
  packageId: string;
  packageName: string;
  amount: number;
  currency: string;
  status: string;
  transactionRef?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CheckoutPayload {
  packageId: string;
  returnUrl?: string;
}

export interface CheckoutResult {
  paymentUrl: string;
  transactionRef: string;
}

// GET /api/Payments – Xem lịch sử thanh toán
export async function fetchPaymentHistory(): Promise<Payment[]> {
  const token = getAuthToken();
  if (!token) return [];

  try {
    const response = await fetch(`${getBaseUrl()}/Payments`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) return [];

    const data = await response.json().catch(() => null);
    return Array.isArray(data) ? data : data?.items || [];
  } catch (e) {
    console.error("Error fetching payment history:", e);
    return [];
  }
}

// GET /api/Payments/{id} – Xem chi tiết một hóa đơn thanh toán
export async function fetchPaymentById(id: string): Promise<Payment | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(
      `${getBaseUrl()}/Payments/${encodeURIComponent(id)}`,
      {
        headers: buildAuthHeaders(),
      }
    );

    if (!response.ok) return null;

    return await response.json().catch(() => null);
  } catch (e) {
    console.error(`Error fetching payment ${id}:`, e);
    return null;
  }
}

// DELETE /api/Payments/{id} – Hủy giao dịch thanh toán chưa hoàn tất
export async function cancelPayment(id: string): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");

  const response = await fetch(
    `${getBaseUrl()}/Payments/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: buildAuthHeaders(),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg =
      errData.error || errData.message || "Hủy giao dịch thanh toán thất bại.";
    throw new Error(errMsg);
  }
}

// POST /api/Payments/checkout – Tạo link thanh toán VNPAY cho gói Boost
export async function createCheckout(
  payload: CheckoutPayload
): Promise<CheckoutResult> {
  const token = getAuthToken();
  if (!token) throw new Error("Vui lòng đăng nhập để thực hiện thanh toán.");

  const response = await fetch(`${getBaseUrl()}/Payments/checkout`, {
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
      errData.error || errData.message || "Tạo link thanh toán thất bại.";
    throw new Error(errMsg);
  }

  return await response.json();
}

// GET /api/Payments/return – Nhận kết quả phản hồi từ VNPAY
export async function fetchPaymentReturn(
  queryString: string
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${getBaseUrl()}/Payments/return?${queryString}`,
      {
        headers: buildAuthHeaders(),
      }
    );

    const data = await response.json().catch(() => ({}));
    return data;
  } catch (e) {
    console.error("Error fetching VNPAY return:", e);
    return {};
  }
}

// POST /api/Payments/ipn – Cập nhật trạng thái thanh toán tự động (IPN)
export async function handlePaymentIpn(
  payload: Record<string, unknown>
): Promise<void> {
  await fetch(`${getBaseUrl()}/Payments/ipn`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify(payload),
  });
}

// GET /api/Payments/mock-pay – Cổng giả lập thanh toán (Development)
export async function fetchMockPayPage(
  transactionRef: string
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `${getBaseUrl()}/Payments/mock-pay?ref=${encodeURIComponent(
        transactionRef
      )}`,
      {
        headers: buildAuthHeaders(),
      }
    );

    const data = await response.json().catch(() => ({}));
    return data;
  } catch (e) {
    console.error("Error fetching mock pay page:", e);
    return {};
  }
}

// POST /api/Payments/mock-pay/confirm – Xác nhận giả lập thanh toán thành công
export async function confirmMockPayment(
  transactionRef: string
): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/Payments/mock-pay/confirm`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify({ transactionRef }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg =
      errData.error || errData.message || "Xác nhận thanh toán thất bại.";
    throw new Error(errMsg);
  }
}

// POST /api/Payments/mock-pay/cancel – Xác nhận giả lập hủy thanh toán
export async function cancelMockPayment(transactionRef: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/Payments/mock-pay/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
    },
    body: JSON.stringify({ transactionRef }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg =
      errData.error || errData.message || "Hủy giả lập thanh toán thất bại.";
    throw new Error(errMsg);
  }
}

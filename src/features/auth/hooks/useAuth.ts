import { useState, useEffect } from "react";
import { mockDb } from "../../../shared/api/mockDb";
import { toast } from "react-toastify";

const getApiUrl = (endpoint: string) => {
  const base = ((import.meta as any).env.VITE_API_URL || "http://localhost:5191/api").replace(/\/+$/, "");
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  return `${base}/${cleanEndpoint}`;
};

export interface UserSession {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  phone?: string;
  token?: string;
  createdAt?: string;
}

function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Global Fetch Interceptor to catch 401 Unauthorized
if (typeof window !== "undefined" && !(window as any).__fetchInterceptorAttached) {
  (window as any).__fetchInterceptorAttached = true;
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch(...args);
    const requestUrl = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
    const apiUrl = ((import.meta as any).env?.VITE_API_URL || "http://localhost:5191/api");
    const isAuthRequest = requestUrl.toLowerCase().includes("/auth/");

    if (response.status === 401 && requestUrl.includes(apiUrl) && !isAuthRequest) {
      console.warn("[Fetch Interceptor] 401 Unauthorized detected for API:", requestUrl);
      const hasUser = localStorage.getItem("swaply_current_user");
      if (hasUser) {
        localStorage.removeItem("swaply_current_user");
        sessionStorage.clear();
        window.location.href = window.location.origin + "?session_expired=true";
      }
    }
    return response;
  };
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    return mockDb.getCurrentUser();
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser || !currentUser.token) return;

    const checkTokenExpiry = () => {
      const token = currentUser.token;
      if (!token) return;
      try {
        const decoded = parseJwt(token);
        if (decoded && decoded.exp) {
          const currentTime = Math.floor(Date.now() / 1000);
          if (decoded.exp < currentTime) {
            console.warn("[useAuth] Token has expired passively. Triggering logout.");
            mockDb.setCurrentUser(null);
            setCurrentUser(null);
            sessionStorage.clear();
            window.location.href = window.location.origin + "?session_expired=true";
          }
        }
      } catch (e) {
        console.error("[useAuth] Error checking token expiry:", e);
      }
    };

    checkTokenExpiry();
    const timer = setInterval(checkTokenExpiry, 5000);
    return () => clearInterval(timer);
  }, [currentUser?.token]);

  useEffect(() => {
    const syncProfile = async () => {
      if (currentUser && currentUser.token) {
        console.log("[syncProfile] Starting profile sync with token...", currentUser.token.substring(0, 20) + "...");
        try {
          const response = await fetch(getApiUrl("Profile"), {
            method: "GET",
            headers: {
              "accept": "*/*",
              "Authorization": currentUser.token.toLowerCase().startsWith("bearer ") ? currentUser.token : `Bearer ${currentUser.token}`
            }
          });
          console.log("[syncProfile] HTTP Response Status:", response.status);
          if (response.ok) {
            const data = await response.json();
            console.log("[syncProfile] Retrieved Profile Data:", data);

            // Fetch current subscription status to determine if user is Premium
            let hasActiveSub = false;
            try {
              const subRes = await fetch(getApiUrl("boost/current"), {
                headers: {
                  "accept": "*/*",
                  "Authorization": currentUser.token.toLowerCase().startsWith("bearer ") ? currentUser.token : `Bearer ${currentUser.token}`
                }
              });
              if (subRes.ok) {
                const subData = await subRes.json().catch(() => null);
                hasActiveSub = subData !== null;
              }
            } catch (err) {
              console.warn("Failed to fetch boost current for premium state:", err);
            }

            const updatedUser: UserSession = {
              ...currentUser,
              id: data.id || currentUser.id,
              name: data.fullName || data.userName || currentUser.name,
              email: data.email || currentUser.email,
              avatar: data.avatarUrl || currentUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
              phone: data.phoneNumber || currentUser.phone || "",
              createdAt: data.createdAt || currentUser.createdAt || "",
              isPremium: hasActiveSub
            };
            mockDb.setCurrentUser(updatedUser);
            console.log("[syncProfile] Updated User session object:", updatedUser);
            if (
              updatedUser.name !== currentUser.name ||
              updatedUser.email !== currentUser.email ||
              updatedUser.avatar !== currentUser.avatar ||
              updatedUser.phone !== currentUser.phone ||
              updatedUser.createdAt !== currentUser.createdAt ||
              updatedUser.isPremium !== currentUser.isPremium
            ) {
              setCurrentUser(updatedUser);
            }
          } else {
            console.warn("[syncProfile] Response not OK. StatusText:", response.statusText);
          }
        } catch (e) {
          console.error("[syncProfile] Exception caught during profile fetch:", e);
        }
      } else {
        console.log("[syncProfile] No logged in user token available for sync.");
      }
    };
    syncProfile();
  }, [currentUser?.token]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const startTime = Date.now();
    const minDelay = 3000; // 3 seconds minimum

    const enforceDelay = async () => {
      const duration = Date.now() - startTime;
      if (duration < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - duration));
      }
    };
    
    try {
      const response = await fetch(getApiUrl("Auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify({ username: email, password })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error || errData.message || errData.title || "Tên đăng nhập hoặc mật khẩu không chính xác.";
        await enforceDelay();
        setIsLoading(false);
        return { success: false, error: errMsg };
      }

      const data = await response.json();
      const token = data.token || data.accessToken || data.data?.token || data.data?.accessToken;
      const decoded = token ? parseJwt(token) : null;
      
      const sessionUser: UserSession = {
        id: data.user?.id || data.userId || decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded?.nameid || decoded?.sub || `user-${Date.now()}`,
        name: data.user?.name || decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded?.name || data.user?.email?.split("@")[0] || decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]?.split("@")[0] || "User",
        email: data.user?.email || decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded?.email || email,
        avatar: data.user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80",
        isPremium: data.user?.isPremium || false,
        phone: data.user?.phone || decoded?.phone || "",
        token: token
      };

      mockDb.setCurrentUser(sessionUser);
      setCurrentUser(sessionUser);
      await enforceDelay();
      setIsLoading(false);
      return { success: true };
    } catch (e) {
      await enforceDelay();
      setIsLoading(false);
      const currentApiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:5191/api";
      return { 
        success: false, 
        error: `Không thể kết nối đến máy chủ API (${currentApiUrl}). Vui lòng đảm bảo Backend API đang chạy hoặc kiểm tra đường truyền mạng.` 
      };
    }
  };

  const register = async (
    name: string,
    username: string,
    email: string,
    password: string,
    phone: string,
    otpCode: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const startTime = Date.now();
    const minDelay = 3000; // 3 seconds minimum

    const enforceDelay = async () => {
      const duration = Date.now() - startTime;
      if (duration < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - duration));
      }
    };

    try {
      const response = await fetch(getApiUrl("Auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify({
          email,
          username,
          password,
          confirmPassword: password,
          phoneNumber: phone,
          fullName: name,
          role: "",
          otpCode
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error || errData.message || "Đăng ký không thành công. Vui lòng kiểm tra mã OTP.";
        await enforceDelay();
        setIsLoading(false);
        return { success: false, error: errMsg };
      }

      await enforceDelay();
      setIsLoading(false);
      const loginRes = await login(username, password);
      if (loginRes.success) {
        return { success: true };
      } else {
        return { success: true };
      }
    } catch (e) {
      await enforceDelay();
      setIsLoading(false);
      const currentApiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:5191/api";
      return { 
        success: false, 
        error: `Không thể kết nối đến máy chủ API (${currentApiUrl}). Vui lòng kiểm tra lại.` 
      };
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    mockDb.setCurrentUser(null);
    setCurrentUser(null);
    setIsLoading(false);
    
    // Clear session-level routing cache
    sessionStorage.clear();
    
    // Redirect to home and trigger a clean hard reload
    window.location.href = window.location.origin;
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const startTime = Date.now();
    const minDelay = 3000; // 3 seconds minimum

    const enforceDelay = async () => {
      const duration = Date.now() - startTime;
      if (duration < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - duration));
      }
    };

    try {
      const response = await fetch(getApiUrl("Auth/forgot-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.message || errData.error || errData.title || "Không thể gửi mã OTP. Vui lòng thử lại.";
        await enforceDelay();
        setIsLoading(false);
        return { success: false, error: errMsg };
      }

      await enforceDelay();
      setIsLoading(false);
      return { success: true };
    } catch (e) {
      await enforceDelay();
      setIsLoading(false);
      const currentApiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:5191/api";
      return { 
        success: false, 
        error: `Không thể kết nối đến máy chủ API (${currentApiUrl}). Vui lòng đảm bảo Backend API đang chạy hoặc kiểm tra đường truyền mạng.` 
      };
    }
  };

  const resetPassword = async (email: string, otpCode: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const startTime = Date.now();
    const minDelay = 3000; // 3 seconds minimum

    const enforceDelay = async () => {
      const duration = Date.now() - startTime;
      if (duration < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - duration));
      }
    };

    try {
      const response = await fetch(getApiUrl("Auth/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify({ email, otpCode, newPassword })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.message || errData.error || errData.title || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.";
        await enforceDelay();
        setIsLoading(false);
        return { success: false, error: errMsg };
      }

      await enforceDelay();
      setIsLoading(false);
      return { success: true };
    } catch (e) {
      await enforceDelay();
      setIsLoading(false);
      const currentApiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:5191/api";
      return { 
        success: false, 
        error: `Không thể kết nối đến máy chủ API (${currentApiUrl}). Vui lòng đảm bảo Backend API đang chạy hoặc kiểm tra đường truyền mạng.` 
      };
    }
  };

  const requestOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(getApiUrl("Auth/request-otp"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*"
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error || errData.message || "Không thể gửi mã OTP. Vui lòng thử lại.";
        return { success: false, error: errMsg };
      }

      return { success: true };
    } catch (e) {
      const currentApiUrl = (import.meta as any).env.VITE_API_URL || "http://localhost:5191/api";
      return { 
        success: false, 
        error: `Không thể kết nối đến máy chủ API (${currentApiUrl}). Vui lòng đảm bảo Backend API đang chạy hoặc kiểm tra đường truyền mạng.` 
      };
    }
  };

  const updateProfile = async (fullName: string, phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || !currentUser.token) {
      return { success: false, error: "Phiên đăng nhập đã hết hạn." };
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl("Profile"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*",
          "Authorization": currentUser.token.toLowerCase().startsWith("bearer ") ? currentUser.token : `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ fullName, phoneNumber })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error || errData.message || "Cập nhật hồ sơ thất bại.";
        setIsLoading(false);
        return { success: false, error: errMsg };
      }

      const data = await response.json();
      
      const updatedUser: UserSession = {
        ...currentUser,
        name: data.fullName || fullName,
        phone: data.phoneNumber || phoneNumber
      };
      
      mockDb.setCurrentUser(updatedUser);
      setCurrentUser(updatedUser);
      setIsLoading(false);
      return { success: true };
    } catch (e) {
      setIsLoading(false);
      return { success: false, error: "Không thể kết nối đến máy chủ." };
    }
  };

  const updateAvatar = async (file: File): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser || !currentUser.token) {
      return { success: false, error: "Phiên đăng nhập đã hết hạn." };
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(getApiUrl("Profile/avatar"), {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Authorization": currentUser.token.toLowerCase().startsWith("bearer ") ? currentUser.token : `Bearer ${currentUser.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error || errData.message || "Cập nhật ảnh đại diện thất bại.";
        setIsLoading(false);
        return { success: false, error: errMsg };
      }

      // Sync updated profile to get the avatarUrl
      const profResponse = await fetch(getApiUrl("Profile"), {
        method: "GET",
        headers: {
          "accept": "*/*",
          "Authorization": currentUser.token.toLowerCase().startsWith("bearer ") ? currentUser.token : `Bearer ${currentUser.token}`
        }
      });
      
      if (profResponse.ok) {
        const profData = await profResponse.json();
        const updatedUser: UserSession = {
          ...currentUser,
          name: profData.fullName || profData.userName || currentUser.name,
          email: profData.email || currentUser.email,
          avatar: profData.avatarUrl || currentUser.avatar,
          phone: profData.phoneNumber || currentUser.phone,
          createdAt: profData.createdAt || currentUser.createdAt
        };
        mockDb.setCurrentUser(updatedUser);
        setCurrentUser(updatedUser);
      }
      setIsLoading(false);
      return { success: true };
    } catch (e) {
      setIsLoading(false);
      return { success: false, error: "Không thể kết nối đến máy chủ." };
    }
  };

  const togglePremium = async (): Promise<void> => {
    if (!currentUser || !currentUser.token) {
      toast.error("Vui lòng đăng nhập để thực hiện nâng cấp Premium.");
      return;
    }

    setIsLoading(true);
    try {
      if (currentUser.isPremium) {
        // Hủy gói Premium hiện tại
        const response = await fetch(getApiUrl("boost/cancel"), {
          method: "DELETE",
          headers: {
            "accept": "*/*",
            "Authorization": currentUser.token.toLowerCase().startsWith("bearer ") ? currentUser.token : `Bearer ${currentUser.token}`
          }
        });
        if (response.ok) {
          toast.success("Đã hủy gói Premium thành công.");
          const updatedUser: UserSession = {
            ...currentUser,
            isPremium: false
          };
          mockDb.setCurrentUser(updatedUser);
          setCurrentUser(updatedUser);
        } else {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error || errData.message || "Hủy gói Premium thất bại.";
          toast.error(errMsg);
        }
      } else {
        // Nâng cấp Premium bằng gói Premium Boost
        const packageId = "22222222-2222-2222-2222-222222222222";
        const response = await fetch(getApiUrl("Payments/checkout"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "accept": "*/*",
            "Authorization": currentUser.token.toLowerCase().startsWith("bearer ") ? currentUser.token : `Bearer ${currentUser.token}`
          },
          body: JSON.stringify({ packageId })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.error || errData.message || "Tạo link thanh toán thất bại.";
          toast.error(errMsg);
          return;
        }

        const data = await response.json();
        if (data.payUrl) {
          toast.info("Đang chuyển hướng đến trang thanh toán...");
          window.location.href = data.payUrl;
        } else {
          toast.error("Không nhận được link thanh toán từ hệ thống.");
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Lỗi xử lý nâng cấp Premium.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentUser,
    isLoggedIn: !!currentUser,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    requestOtp,
    updateProfile,
    updateAvatar,
    togglePremium
  };
}

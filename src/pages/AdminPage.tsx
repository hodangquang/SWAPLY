import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Tags,
  GitPullRequest,
  DollarSign,
  AlertTriangle,
  ShieldAlert,
  Star,
  Bell,
  Settings,
  LogOut,
  Search,
  Globe,
  Sun,
  Moon,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Edit,
  Filter,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Ban,
  UserCheck,
  Activity,
  ChevronRight,
  ChevronLeft,
  User,
  UserPlus,
  Calendar,
  Smartphone,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Pencil,
  Check,
  Eye,
  AlertCircle
} from "lucide-react";
import { Category, Property } from "@/types";
import { apiClient } from "@shared/api/apiClient";
import { toast } from "react-toastify";
import Loader from "@shared/components/Loader";

interface AdminPageProps {
  properties: Property[];
  onReloadData: () => Promise<void>;
}

export default function AdminPage({ properties, onReloadData }: AdminPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem("swaply_admin_logged_in") === "true";
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [darkMode, setDarkMode] = useState(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "users" | "products" | "categories" | "requests" | "reports" | "settings"
  >("dashboard");

  // Lists
  const [usersList, setUsersList] = useState<any[]>([]);
  const [pendingListings, setPendingListings] = useState<Property[]>([]);
  const [backendCategories, setBackendCategories] = useState<Category[]>([]);
  const [customCategories, setCustomCategories] = useState<{ id: string; name: string }[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);

  // Search & Filter States
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [listingSearchQuery, setListingSearchQuery] = useState("");

  // Create User Form State
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("User");

  // Category Forms State
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [isCategoryEditOpen, setIsCategoryEditOpen] = useState(false);
  const [isCategoryDetailOpen, setIsCategoryDetailOpen] = useState(false);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<Category | null>(null);

  // Listing Detail Modal State
  const [isListingDetailOpen, setIsListingDetailOpen] = useState(false);
  const [selectedListingDetail, setSelectedListingDetail] = useState<Property | null>(null);

  // Notification center simulator
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Đề xuất trao đổi mới", desc: "User quangnm vừa gửi đề xuất trao đổi đồ.", time: "5 phút trước", read: false },
    { id: 2, title: "Yêu cầu kiểm duyệt tin", desc: "Hồ Đăng Quang đăng bán 'Iphone 12 Pro Max' chờ duyệt.", time: "15 phút trước", read: false },
    { id: 3, title: "Báo cáo nội dung xấu", desc: "Sản phẩm #Listing-42 bị người dùng báo cáo là tin giả.", time: "1 giờ trước", read: true },
  ]);
  const [isNotiDropdownOpen, setIsNotiDropdownOpen] = useState(false);

  // Load state lists on mount/auth state change
  useEffect(() => {
    const loadAdminData = async () => {
      if (!isAdminLoggedIn) return;
      setIsLoading(true);

      // Load Users list
      try {
        const remoteUsers = await apiClient.fetchAdminUsers("", 1, 100);
        if (remoteUsers && remoteUsers.length > 0) {
          setUsersList(remoteUsers);
        } else {
          const storedUsers = localStorage.getItem("swaply_users");
          if (storedUsers) {
            setUsersList(JSON.parse(storedUsers));
          } else {
            const defaultUsers = [
              { id: "user-1", name: "Nguyễn Minh Quang", username: "quangnm", email: "quangnm@gmail.com", phone: "0987654321", role: "User", status: "Active", verification: "Verified", createdAt: "2026-06-15" },
              { id: "user-2", name: "Trần Thị Lan", username: "lantt", email: "lantt@gmail.com", phone: "0912345678", role: "User", status: "Active", verification: "Verified", createdAt: "2026-07-02" },
              { id: "user-3", name: "Lê Hoàng Nam", username: "namlh", email: "namlh@gmail.com", phone: "0933445566", role: "User", status: "Blocked", verification: "Unverified", createdAt: "2026-07-10" },
              { id: "admin-id", name: "Hồ Đăng Quang", username: "admin", email: "admin@swaply.vn", phone: "0999999999", role: "Admin", status: "Active", verification: "Verified", createdAt: "2026-05-20" },
            ];
            setUsersList(defaultUsers);
            localStorage.setItem("swaply_users", JSON.stringify(defaultUsers));
          }
        }
      } catch (e) {
        console.warn("Fetch remote admin users failed, fallback to local storage:", e);
        const storedUsers = localStorage.getItem("swaply_users");
        if (storedUsers) {
          setUsersList(JSON.parse(storedUsers));
        } else {
          const defaultUsers = [
            { id: "user-1", name: "Nguyễn Minh Quang", username: "quangnm", email: "quangnm@gmail.com", phone: "0987654321", role: "User", status: "Active", verification: "Verified", createdAt: "2026-06-15" },
            { id: "user-2", name: "Trần Thị Lan", username: "lantt", email: "lantt@gmail.com", phone: "0912345678", role: "User", status: "Active", verification: "Verified", createdAt: "2026-07-02" },
            { id: "user-3", name: "Lê Hoàng Nam", username: "namlh", email: "namlh@gmail.com", phone: "0933445566", role: "User", status: "Blocked", verification: "Unverified", createdAt: "2026-07-10" },
            { id: "admin-id", name: "Hồ Đăng Quang", username: "admin", email: "admin@swaply.vn", phone: "0999999999", role: "Admin", status: "Active", verification: "Verified", createdAt: "2026-05-20" },
          ];
          setUsersList(defaultUsers);
          localStorage.setItem("swaply_users", JSON.stringify(defaultUsers));
        }
      }

      // Load Backend categories list
      try {
        const categories = await apiClient.fetchCategories();
        setBackendCategories(categories);
      } catch {
        setBackendCategories([]);
      }

      // Load Pending listings list
      try {
        const adminListings = await apiClient.fetchPendingListings();
        setPendingListings(adminListings);
      } catch {
        setPendingListings([]);
      }

      // Load Custom categories list
      try {
        const storedCats = localStorage.getItem("swaply_custom_categories");
        if (storedCats) {
          setCustomCategories(JSON.parse(storedCats));
        }
      } catch {
        // ignore
      }

      // Load Reports list
      try {
        const reports = await apiClient.fetchAdminReports(1, 100);
        setReportsList(reports);
      } catch (e) {
        console.warn("Failed to load admin reports:", e);
        setReportsList([]);
      }

      setIsLoading(false);
    };

    loadAdminData();
  }, [isAdminLoggedIn]);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (username === "admin" && password === "admin123") {
      setIsAdminLoggedIn(true);
      localStorage.setItem("swaply_admin_logged_in", "true");
      localStorage.setItem(
        "swaply_current_user",
        JSON.stringify({
          id: "admin-id",
          name: "Hồ Đăng Quang",
          username: "admin",
          token: "mock-admin-token",
          role: "Admin",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"
        })
      );
      toast.success("Đăng nhập Admin thành công!");
      setIsLoading(false);
      return;
    }

    try {
      const getApiUrl = (endpoint: string) =>
        `${(import.meta as any).env?.VITE_API_URL || "http://localhost:5191/api"}/${endpoint}`;
      const response = await fetch(getApiUrl("Auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        toast.error("Tên đăng nhập hoặc mật khẩu không chính xác.");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      const token = data.token || data.accessToken || data.data?.token || data.data?.accessToken;

      setIsAdminLoggedIn(true);
      localStorage.setItem("swaply_admin_logged_in", "true");
      localStorage.setItem(
        "swaply_current_user",
        JSON.stringify({
          id: data.user?.id || "admin-id",
          name: data.user?.name || "System Admin",
          username: username,
          token: token,
          role: "Admin",
        })
      );
      toast.success("Đăng nhập Admin thành công!");
    } catch {
      toast.error("Không thể kết nối đến máy chủ API.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem("swaply_admin_logged_in");
    toast.info("Đã đăng xuất khỏi tài khoản Admin.");
  };

  // Listings Action Handlers
  const handleUpdateStatus = async (id: string, status: Property["status"]) => {
    setIsLoading(true);
    try {
      if (status === "Active") {
        await apiClient.approveListing(id);
      } else if (status === "Rejected") {
        await apiClient.rejectListing(id, "Tin đăng không phù hợp với quy định.");
      } else {
        await apiClient.updatePropertyStatus(id, status);
      }

      setPendingListings((prev) => prev.filter((item) => item.id !== id));
      await onReloadData();
      toast.success(`Đã phê duyệt trạng thái bài đăng thành công!`);
    } catch (err: any) {
      toast.error(err.message || "Cập nhật trạng thái thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tin đăng này không?")) {
      setIsLoading(true);
      try {
        await apiClient.deleteProperty(id);
        await onReloadData();
        setPendingListings((prev) => prev.filter((item) => item.id !== id));
        toast.success("Đã xóa tin đăng khỏi hệ thống!");
      } catch (err: any) {
        toast.error(err.message || "Xóa tin đăng thất bại.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Users Management Handlers
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserUsername || !newUserEmail) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name: newUserName,
      username: newUserUsername,
      email: newUserEmail,
      phone: newUserPhone || "N/A",
      role: newUserRole,
      status: "Active",
      verification: "Verified",
      createdAt: new Date().toISOString().split("T")[0]
    };

    const updated = [newUser, ...usersList];
    setUsersList(updated);
    localStorage.setItem("swaply_users", JSON.stringify(updated));
    toast.success("Tạo tài khoản thành viên thành công!");

    // Clear forms
    setNewUserName("");
    setNewUserUsername("");
    setNewUserEmail("");
    setNewUserPhone("");
    setNewUserPassword("");
    setNewUserRole("User");
    setIsAddUserOpen(false);
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    const updated = usersList.map((u) => {
      if (u.id === userToEdit.id) {
        return {
          ...u,
          name: userToEdit.name,
          email: userToEdit.email,
          phone: userToEdit.phone,
          role: userToEdit.role,
          status: userToEdit.status
        };
      }
      return u;
    });

    setUsersList(updated);
    localStorage.setItem("swaply_users", JSON.stringify(updated));
    toast.success("Cập nhật thông tin thành viên thành công!");
    setIsEditUserOpen(false);
    setUserToEdit(null);
  };

  const handleToggleUserStatus = async (id: string) => {
    const user = usersList.find((u) => u.id === id);
    if (!user) return;

    const isCurrentlyActive = user.status === "Active";
    setIsLoading(true);
    try {
      if (isCurrentlyActive) {
        await apiClient.lockUser(id);
        toast.success(`Đã khóa tạm thời tài khoản ${user.username || user.name}!`);
      } else {
        await apiClient.unlockUser(id);
        toast.success(`Đã kích hoạt lại tài khoản ${user.username || user.name}!`);
      }

      // Update state locally
      const updated = usersList.map((u) => {
        if (u.id === id) {
          return { ...u, status: isCurrentlyActive ? "Blocked" : "Active" };
        }
        return u;
      });
      setUsersList(updated);
      localStorage.setItem("swaply_users", JSON.stringify(updated));
    } catch (err: any) {
      toast.error(err.message || "Thao tác thay đổi trạng thái khóa thất bại.");

      // Fallback local update
      const nextStatus = isCurrentlyActive ? "Blocked" : "Active";
      const updated = usersList.map((u) => {
        if (u.id === id) {
          return { ...u, status: nextStatus };
        }
        return u;
      });
      setUsersList(updated);
      localStorage.setItem("swaply_users", JSON.stringify(updated));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUserClick = (id: string) => {
    setUserIdToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteUser = () => {
    if (!userIdToDelete) return;
    const updated = usersList.filter((u) => u.id !== userIdToDelete);
    setUsersList(updated);
    localStorage.setItem("swaply_users", JSON.stringify(updated));
    toast.success("Đã xóa tài khoản vĩnh viễn khỏi hệ thống.");
    setIsDeleteConfirmOpen(false);
    setUserIdToDelete(null);
  };

  const handlePromoteUser = (id: string) => {
    const updated = usersList.map((u) => {
      if (u.id === id) {
        toast.success(`Đã nâng cấp quyền của ${u.username} lên Admin!`);
        return { ...u, role: "Admin" };
      }
      return u;
    });
    setUsersList(updated);
    localStorage.setItem("swaply_users", JSON.stringify(updated));
  };

  // Categories Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const nameExists =
      customCategories.some((c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase()) ||
      backendCategories.some((c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase());

    if (nameExists) {
      toast.error("Danh mục này đã tồn tại.");
      return;
    }

    setIsLoading(true);
    try {
      const created = await apiClient.createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || "Được tạo từ Dashboard Admin",
      });

      setBackendCategories((prev) => [
        ...prev,
        {
          id: created.id || `cat-${Date.now()}`,
          name: created.name || newCategoryName.trim(),
          description: created.description || newCategoryDesc.trim() || "",
        },
      ]);
      setNewCategoryName("");
      setNewCategoryDesc("");
      toast.success(`Tạo danh mục "${newCategoryName.trim()}" thành công!`);
      await onReloadData();
    } catch {
      // fallback local storage if backend failed
      const mockId = `custom-cat-${Date.now()}`;
      const newCat = { id: mockId, name: newCategoryName.trim(), description: newCategoryDesc.trim() };
      const updated = [...customCategories, newCat];
      setCustomCategories(updated);
      localStorage.setItem("swaply_custom_categories", JSON.stringify(updated));
      setNewCategoryName("");
      setNewCategoryDesc("");
      toast.success(`Lưu danh mục tạm thời thành công!`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      setIsLoading(true);
      try {
        const target = backendCategories.find((cat) => cat.id === id);
        if (target) {
          await apiClient.deleteCategory(id);
          setBackendCategories((prev) => prev.filter((cat) => cat.id !== id));
        } else {
          const updated = customCategories.filter((c) => c.id !== id);
          setCustomCategories(updated);
          localStorage.setItem("swaply_custom_categories", JSON.stringify(updated));
        }
        toast.success("Xóa danh mục thành công!");
        await onReloadData();
      } catch {
        toast.error("Không thể xóa danh mục hệ thống.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenEditCategory = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name || "");
    setEditCategoryDescription(category.description || "");
    setIsCategoryEditOpen(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setIsLoading(true);
    try {
      const targetCategory = backendCategories.find((cat) => cat.id === editingCategory.id);
      if (targetCategory) {
        const updated = await apiClient.updateCategory(editingCategory.id, {
          name: editCategoryName.trim(),
          description: editCategoryDescription.trim(),
        });
        setBackendCategories((prev) =>
          prev.map((cat) => (cat.id === editingCategory.id ? { ...cat, ...updated } : cat))
        );
      } else {
        const updatedCustom = customCategories.map((cat) =>
          cat.id === editingCategory.id ? { ...cat, name: editCategoryName.trim(), description: editCategoryDescription.trim() } : cat
        );
        setCustomCategories(updatedCustom);
        localStorage.setItem("swaply_custom_categories", JSON.stringify(updatedCustom));
      }
      toast.success("Cập nhật danh mục thành công!");
      setIsCategoryEditOpen(false);
      setEditingCategory(null);
      await onReloadData();
    } catch {
      toast.error("Cập nhật danh mục thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCategoryDetail = async (id: string, name: string) => {
    setIsLoading(true);
    try {
      const detail = await apiClient.fetchCategoryById(id);
      setSelectedCategoryDetail(detail || { id, name, description: "Không có mô tả chi tiết từ API." });
      setIsCategoryDetailOpen(true);
    } catch {
      setSelectedCategoryDetail({ id, name, description: "Kết nối API thất bại. Hiển thị thông tin nội bộ." });
      setIsCategoryDetailOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewListingDetail = async (id: string) => {
    setIsLoading(true);
    try {
      const detail = await apiClient.fetchAdminListingById(id);
      if (detail) {
        setSelectedListingDetail(detail);
        setIsListingDetailOpen(true);
      } else {
        toast.error("Không tìm thấy thông tin chi tiết của tin đăng này.");
      }
    } catch (err: any) {
      toast.error(err.message || "Tải chi tiết tin đăng thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper lists categories
  const categoryRows = useMemo(() => {
    const list: Category[] = [];
    const seen = new Set<string>();

    backendCategories.forEach((c) => {
      const nameKey = c.name.trim().toLowerCase();
      if (!seen.has(nameKey)) {
        seen.add(nameKey);
        list.push(c);
      }
    });

    customCategories.forEach((c) => {
      const nameKey = c.name.trim().toLowerCase();
      if (!seen.has(nameKey)) {
        seen.add(nameKey);
        list.push({ id: c.id, name: c.name, description: "Danh mục tự tạo" });
      }
    });

    return list;
  }, [backendCategories, customCategories]);

  // Filtering users list
  const filteredUsers = useMemo(() => {
    return usersList.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        user.id?.toLowerCase().includes(userSearchQuery.toLowerCase());

      const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;
      const matchesStatus = userStatusFilter === "all" || user.status === userStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [usersList, userSearchQuery, userRoleFilter, userStatusFilter]);

  // Filter listings
  const filteredListings = useMemo(() => {
    return pendingListings.filter((listing) =>
      listing.title?.toLowerCase().includes(listingSearchQuery.toLowerCase()) ||
      listing.ownerName?.toLowerCase().includes(listingSearchQuery.toLowerCase())
    );
  }, [pendingListings, listingSearchQuery]);

  // Simulated & Dynamic metrics
  const totalUserCount = usersList.length;
  const activeListingsCount = properties.filter((p) => p.status === "Active" || p.status === "Approved").length;
  const pendingRequestsCount = pendingListings.length;

  const totalMarketValue = useMemo(() => {
    return properties.reduce((sum, p) => sum + (p.estimatedValue || p.price || 0), 0);
  }, [properties]);

  const approvalRate = useMemo(() => {
    if (properties.length === 0) return "100%";
    const approved = properties.filter((p) => p.status === "Active" || p.status === "Approved").length;
    return `${((approved / properties.length) * 100).toFixed(1)}%`;
  }, [properties]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    properties.forEach((p) => {
      const catName = p.categoryName || p.category || "Danh mục khác";
      stats[catName] = (stats[catName] || 0) + 1;
    });

    const total = properties.length || 1;
    const colors = ["#FF4D6D", "#FFA6C9", "#FFCCD5", "#FFE3E8"];

    const sortedStats = Object.entries(stats)
      .map(([name, count], idx) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
        color: colors[idx % colors.length]
      }))
      .sort((a, b) => b.count - a.count);

    if (sortedStats.length === 0) {
      return [
        { name: "Thời trang / Quần áo", count: 0, percent: 0, color: "#FF4D6D" },
        { name: "Đồ công nghệ / Điện tử", count: 0, percent: 0, color: "#FFA6C9" },
        { name: "Sách & Văn phòng phẩm", count: 0, percent: 0, color: "#FFCCD5" },
        { name: "Đồ gia dụng / Đồ bếp", count: 0, percent: 0, color: "#FFE3E8" },
      ];
    }
    return sortedStats.slice(0, 4);
  }, [properties]);

  const chartData = useMemo(() => {
    const total = properties.length || 5;
    const scale = (val: number) => 170 - (val / total) * 120;

    const y1 = scale(Math.round(total * 0.15));
    const y2 = scale(Math.round(total * 0.35));
    const y3 = scale(Math.round(total * 0.25));
    const y4 = scale(Math.round(total * 0.65));
    const y5 = scale(Math.round(total * 0.8));
    const y6 = scale(total);

    return {
      path: `M 0 ${y1} C 100 ${y2}, 200 ${y3}, 300 ${(y3 + y4) / 2} C 400 ${y4}, 500 ${y5}, 600 ${y6}`,
      fillPath: `M 0 ${y1} C 100 ${y2}, 200 ${y3}, 300 ${(y3 + y4) / 2} C 400 ${y4}, 500 ${y5}, 600 ${y6} L 600 200 L 0 200 Z`,
      coords: [
        { cx: 100, cy: y2 },
        { cx: 200, cy: y3 },
        { cx: 300, cy: (y3 + y4) / 2 },
        { cx: 400, cy: y4 },
        { cx: 500, cy: y5 }
      ]
    };
  }, [properties]);

  const recentSystemActivities = useMemo(() => {
    const list = [];

    if (pendingRequestsCount > 0) {
      list.push({
        icon: AlertCircle,
        text: `Hệ thống ghi nhận ${pendingRequestsCount} tin đăng mới đang chờ kiểm duyệt`,
        time: "Mới nhất",
        color: "text-amber-600 bg-amber-50"
      });
    }

    if (activeListingsCount > 0) {
      const activeListings = properties.filter((p) => p.status === "Active" || p.status === "Approved");
      const latest = activeListings[0];
      if (latest) {
        list.push({
          icon: CheckCircle2,
          text: `Tin đăng "${latest.title}" đã được duyệt hoạt động trên hệ thống`,
          time: "Vừa xong",
          color: "text-emerald-600 bg-emerald-50"
        });
      }
    }

    if (totalUserCount > 0) {
      const latestUser = usersList[0] || { name: "Thành viên mới" };
      list.push({
        icon: UserPlus,
        text: `Thành viên mới "${latestUser.name || latestUser.username}" đăng ký tài khoản thành công`,
        time: "Hôm nay",
        color: "text-blue-600 bg-blue-50"
      });
    }

    if (list.length === 0) {
      list.push({
        icon: Activity,
        text: "Hệ thống hoạt động bình thường, không có cảnh báo mới.",
        time: "Hiện tại",
        color: "text-[#FF4D6D] bg-[#FF4D6D]/10"
      });
    }

    return list;
  }, [properties, pendingRequestsCount, activeListingsCount, totalUserCount, usersList]);

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 font-sans select-none relative overflow-hidden">
        {/* Decorative subtle gradient background shapes */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] aspect-square bg-[#FF4D6D]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] aspect-square bg-[#FF4D6D]/5 rounded-full blur-[120px]" />

        <div className="w-full max-w-[1100px] bg-white border border-[#EAEAEA] shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] animate-in fade-in duration-300">

          {/* Left panel: branding branding */}
          <div className="lg:col-span-5 bg-[#FF4D6D] p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[150%] aspect-square bg-white/5 rounded-full translate-x-[20%] translate-y-[-20%] pointer-events-none" />

            <div className="flex items-center gap-2.5 z-10">
              <div className="h-10 w-10 bg-white text-[#FF4D6D] rounded-xl flex items-center justify-center font-sans font-black text-xl shadow-md">
                S
              </div>
              <span className="font-sans font-black tracking-tight text-2xl">SWAPLY</span>
            </div>

            <div className="space-y-4 z-10">
              <h2 className="text-3xl font-black leading-tight tracking-tight">Hệ thống Quản trị Toàn diện</h2>
              <p className="text-white/80 text-sm leading-relaxed font-sans">
                Giám sát trao đổi hàng hóa, kiểm duyệt tin đăng nhanh chóng, điều phối tài khoản thành viên và tối ưu hóa hệ sinh thái barter.
              </p>
            </div>

            <div className="text-[10px] text-white/60 tracking-wider uppercase font-mono z-10">
              Swaply Barter Marketplace v1.2.0
            </div>
          </div>

          {/* Right panel: Login form */}
          <div className="lg:col-span-7 p-12 flex flex-col justify-center">
            <div className="max-w-md w-full mx-auto space-y-8">
              <div className="space-y-2">
                <h1 className="text-2xl font-black tracking-tight text-[#1F2937]">Xin chào, Admin!</h1>
                <p className="text-[#6B7280] text-sm">Vui lòng nhập tài khoản quản trị để đăng nhập hệ thống điều hành.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1 relative">
                  <label className="text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">Tên đăng nhập</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                    <input
                      type="text"
                      required
                      placeholder="Username hoặc Email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl py-3.5 pl-11 pr-4 text-sm text-[#1F2937] outline-none focus:border-[#FF4D6D] focus:ring-1 focus:ring-[#FF4D6D] transition"
                    />
                  </div>
                </div>

                <div className="space-y-1 relative">
                  <label className="text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl py-3.5 pl-11 pr-4 text-sm text-[#1F2937] outline-none focus:border-[#FF4D6D] focus:ring-1 focus:ring-[#FF4D6D] transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF4D6D] hover:bg-[#FF335C] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#FF4D6D]/10 hover:shadow-[#FF4D6D]/20 active:scale-[0.98] transition duration-200 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {isLoading && <Loader message="Đang kết nối cổng quản trị..." />}
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-950 text-white" : "bg-[#FAFAFA] text-[#1F2937]"} font-sans flex select-none`}>
      {/* 1. Left Sidebar Navigation */}
      <aside className={`w-[260px] shrink-0 border-r border-[#EAEAEA] flex flex-col justify-between p-6 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-[#EAEAEA]"}`}>
        <div className="space-y-8">
          {/* Logo Brand Header */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="h-9 w-9 bg-[#FF4D6D] text-white rounded-xl flex items-center justify-center font-sans font-black text-lg shadow-sm">
              S
            </div>
            <span className="font-sans font-black tracking-tight text-xl text-[#1F2937]">
              SWAPLY <span className="text-[10px] text-[#FF4D6D] font-bold align-super">ADMIN</span>
            </span>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            {[
              { id: "dashboard", label: "Bảng tổng quan", icon: LayoutDashboard },
              { id: "users", label: "Thành viên", icon: Users },
              { id: "products", label: "Kiểm duyệt tin", icon: ShoppingBag, badge: pendingListings.length },
              { id: "categories", label: "Danh mục đồ", icon: Tags },
              { id: "requests", label: "Yêu cầu trao đổi", icon: GitPullRequest },
              { id: "reports", label: "Báo cáo / Khiếu nại", icon: AlertTriangle },
              { id: "settings", label: "Cài đặt hệ thống", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition relative group cursor-pointer ${isActive
                    ? "bg-[#FF4D6D]/10 text-[#FF4D6D]"
                    : "text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 ${isActive ? "text-[#FF4D6D]" : "text-[#6B7280] group-hover:text-[#1F2937]"}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="bg-[#FF4D6D] text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-4">
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${darkMode ? "bg-gray-950 border-gray-800" : "bg-[#FAFAFA] border-[#EAEAEA]"}`}>
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"
              alt="Avatar"
              className="h-9 w-9 rounded-full object-cover border border-[#EAEAEA]"
            />
            <div className="min-w-0">
              <span className="block text-xs font-bold text-[#1F2937] truncate">Hồ Đăng Quang</span>
              <span className="block text-[9px] text-[#6B7280] font-medium uppercase tracking-wider">Super Admin</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-[#6B7280] hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/5 transition cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen">
        {/* Top Header Navigation */}
        <header className={`h-20 border-b px-8 flex items-center justify-between sticky top-0 z-30 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-[#EAEAEA]"}`}>
          {/* Top Search bar */}
          <div className="relative w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Tìm kiếm tác vụ, hóa đơn, user..."
              className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-2xl py-2.5 pl-11 pr-4 text-xs text-[#1F2937] outline-none focus:border-[#FF4D6D] transition"
            />
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-4 relative">
            {/* Language Switcher */}
            <button
              onClick={() => {
                setLang(lang === "vi" ? "en" : "vi");
                toast.success(`Đã chuyển sang tiếng ${lang === "vi" ? "Anh" : "Việt"}!`);
              }}
              className="h-10 w-10 hover:bg-gray-50 border border-[#EAEAEA] rounded-full flex items-center justify-center text-[#1F2937] transition cursor-pointer"
              title="Đổi ngôn ngữ / Change Language"
            >
              <Globe className="h-4.5 w-4.5 text-[#6B7280]" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => {
                setDarkMode(!darkMode);
                toast.info("Đã chuyển đổi giao diện!");
              }}
              className="h-10 w-10 hover:bg-gray-50 border border-[#EAEAEA] rounded-full flex items-center justify-center text-[#1F2937] transition cursor-pointer"
              title="Chuyển chế độ tối"
            >
              {darkMode ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-[#6B7280]" />}
            </button>

            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotiDropdownOpen(!isNotiDropdownOpen)}
                className="h-10 w-10 hover:bg-gray-50 border border-[#EAEAEA] rounded-full flex items-center justify-center text-[#1F2937] relative transition cursor-pointer"
                title="Thông báo hệ thống"
              >
                <Bell className="h-4.5 w-4.5 text-[#6B7280]" />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#FF4D6D]" />
                )}
              </button>

              {isNotiDropdownOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-[#EAEAEA] shadow-xl rounded-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <div className="px-4 pb-2 border-b border-[#EAEAEA] flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1F2937]">Thông báo hệ thống</span>
                    <button
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                        toast.success("Đã đọc tất cả thông báo.");
                      }}
                      className="text-[10px] text-[#FF4D6D] hover:underline font-semibold"
                    >
                      Đánh dấu đã đọc
                    </button>
                  </div>
                  <div className="divide-y divide-[#EAEAEA] max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-3 text-xs transition hover:bg-gray-50 ${!n.read ? "bg-[#FF4D6D]/5" : ""}`}>
                        <div className="flex justify-between font-bold text-[#1F2937]">
                          <span>{n.title}</span>
                          <span className="text-[9px] text-[#6B7280] font-normal">{n.time}</span>
                        </div>
                        <p className="text-[#6B7280] text-[11px] mt-0.5 leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Admin Avatar badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1F2937] hidden sm:inline">Hồ Đăng Quang</span>
              <div className="h-9 w-9 rounded-full bg-[#FF4D6D]/10 text-[#FF4D6D] font-bold flex items-center justify-center border border-[#EAEAEA] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"
                  alt="admin"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </header>

        {/* 3. Render Dashboard Tabs depending on activeTab */}
        <div className="p-8 space-y-8 flex-1">

          {/* TAB 1: DASHBOARD TAB OVERVIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-300">

              {/* Header Title Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-[#1F2937]">Bảng tổng quan</h1>
                  <p className="text-[#6B7280] text-xs">Theo dõi thời gian thực các chỉ số đo lường hiệu suất hoạt động của hệ thống.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setIsLoading(true);
                      await onReloadData();
                      try {
                        const remoteUsers = await apiClient.fetchAdminUsers("", 1, 100);
                        if (remoteUsers && remoteUsers.length > 0) setUsersList(remoteUsers);
                      } catch (e) {
                        console.warn(e);
                      }
                      try {
                        const adminListings = await apiClient.fetchPendingListings();
                        setPendingListings(adminListings);
                      } catch (e) {
                        console.warn(e);
                      }
                      try {
                        const reports = await apiClient.fetchAdminReports(1, 100);
                        if (reports) setReportsList(reports);
                      } catch (e) {
                        console.warn(e);
                      }
                      toast.success("Đã đồng bộ hóa dữ liệu mới nhất!");
                      setIsLoading(false);
                    }}
                    className="flex items-center gap-2 border border-[#EAEAEA] hover:bg-gray-50 text-[#1F2937] font-semibold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-[#6B7280]" />
                    <span>Làm mới</span>
                  </button>
                  <button
                    onClick={() => toast.success("Đang xuất báo cáo PDF...")}
                    className="flex items-center gap-2 bg-[#FF4D6D] hover:bg-[#FF335C] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer shadow-md"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Xuất báo cáo</span>
                  </button>
                </div>
              </div>

              {/* Statistics Cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
                {[
                  { label: "Tổng thành viên", value: totalUserCount, desc: "Thành viên đã đăng ký", icon: Users, trend: `+${Math.max(1, Math.round(totalUserCount * 0.1))}`, up: true },
                  { label: "Tin hoạt động", value: activeListingsCount, desc: "Sản phẩm đang hiển thị", icon: ShoppingBag, trend: `+${Math.max(1, Math.round(activeListingsCount * 0.05))}`, up: true },
                  { label: "Tin chờ duyệt", value: pendingRequestsCount, desc: "Bài viết chờ kiểm duyệt", icon: CheckCircle2, trend: `${pendingRequestsCount > 0 ? `+${pendingRequestsCount}` : "0"}`, up: pendingRequestsCount > 0 },
                  { label: "Tổng danh mục", value: categoryRows.length, desc: "Nhóm sản phẩm hiện có", icon: Tags, trend: `+${categoryRows.length > 5 ? categoryRows.length - 5 : 0}`, up: true },
                  { label: "Tổng giá trị chợ", value: `${(totalMarketValue / 1000000).toFixed(1)}M đ`, desc: "Giá trị ước tính hàng hóa", icon: DollarSign, trend: "+15%", up: true },
                  { label: "Tỷ lệ duyệt tin", value: approvalRate, desc: "Tin đăng đúng quy chuẩn", icon: UserCheck, trend: "+2%", up: true },
                ].map((stat, idx) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={idx} className="bg-white border border-[#EAEAEA] rounded-3xl p-5 shadow-xs space-y-3 transition duration-200 hover:shadow-md hover:border-[#FF4D6D]/20 text-left">
                      <div className="flex justify-between items-center">
                        <div className="h-9 w-9 rounded-xl bg-[#FF4D6D]/10 text-[#FF4D6D] flex items-center justify-center shadow-xs">
                          <StatIcon className="h-4.5 w-4.5" />
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 ${stat.up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          }`}>
                          {stat.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {stat.trend}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">{stat.label}</h4>
                        <span className="text-2xl font-black text-[#1F2937] tracking-tight">{stat.value}</span>
                        <p className="text-[9px] text-[#6B7280] font-medium mt-0.5">{stat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Graphical Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* 1. Exchange Activity Line Chart (16/9 Area Chart) */}
                <div className="lg:col-span-8 bg-white border border-[#EAEAEA] rounded-[24px] p-6 shadow-xs text-left space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm text-[#1F2937] tracking-wide">Tần suất giao dịch trao đổi</h3>
                      <p className="text-[10px] text-[#6B7280]">Khối lượng đề xuất đổi đồ thành công hàng tuần.</p>
                    </div>
                    <select className="border border-[#EAEAEA] rounded-xl px-3 py-1.5 text-[10px] font-bold text-[#6B7280] outline-none">
                      <option>Tháng này</option>
                      <option>Tháng trước</option>
                      <option>Năm nay</option>
                    </select>
                  </div>

                  {/* SVG Premium Area Chart chart */}
                  <div className="w-full h-64 relative bg-[#FAFAFA] rounded-2xl border border-[#EAEAEA] p-4 flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF4D6D" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#FF4D6D" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="50" x2="600" y2="50" stroke="#EAEAEA" strokeDasharray="4 4" />
                      <line x1="0" y1="100" x2="600" y2="100" stroke="#EAEAEA" strokeDasharray="4 4" />
                      <line x1="0" y1="150" x2="600" y2="150" stroke="#EAEAEA" strokeDasharray="4 4" />

                      {/* Area fill */}
                      <path
                        d={chartData.fillPath}
                        fill="url(#chartGradient)"
                      />
                      {/* Stroke Line */}
                      <path
                        d={chartData.path}
                        fill="none"
                        stroke="#FF4D6D"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {/* Interaction circles */}
                      {chartData.coords.map((coord, idx) => (
                        <circle key={idx} cx={coord.cx} cy={coord.cy} r="4.5" fill="#FF4D6D" stroke="white" strokeWidth="1.5" />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* 2. Category Distribution donut chart bar */}
                <div className="lg:col-span-4 bg-white border border-[#EAEAEA] rounded-[24px] p-6 shadow-xs text-left space-y-4">
                  <div>
                    <h3 className="font-bold text-sm text-[#1F2937] tracking-wide">Danh mục phổ biến nhất</h3>
                    <p className="text-[10px] text-[#6B7280]">Tỷ lệ tin đăng thuộc các nhóm danh mục.</p>
                  </div>

                  <div className="space-y-3.5 pt-2">
                    {categoryStats.map((cat, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-bold text-[#1F2937]">
                          <span>{cat.name}</span>
                          <span className="text-slate">{cat.count} tin ({cat.percent}%)</span>
                        </div>
                        <div className="h-2 w-full bg-[#FAFAFA] rounded-full overflow-hidden border border-[#EAEAEA]">
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lower Section: New Users & Activities Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                {/* Left: Recent Activities Timeline */}
                <div className="bg-white border border-[#EAEAEA] rounded-[24px] p-6 shadow-xs space-y-4">
                  <h3 className="font-bold text-sm text-[#1F2937]">Nhật ký hệ thống</h3>
                  <div className="space-y-4.5 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAEAEA]">
                    {recentSystemActivities.map((act, i) => {
                      const ActIcon = act.icon;
                      return (
                        <div key={i} className="flex gap-4 relative">
                          <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center shrink-0 border border-[#EAEAEA] ${act.color} z-10`}>
                            <ActIcon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-xs text-[#1F2937] font-semibold">{act.text}</p>
                            <span className="text-[9px] text-[#6B7280] mt-0.5 block">{act.time}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Newest Registered Users */}
                <div className="bg-white border border-[#EAEAEA] rounded-[24px] p-6 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-[#1F2937]">Thành viên mới</h3>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="text-[11px] text-[#FF4D6D] hover:underline font-bold"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="divide-y divide-[#EAEAEA]">
                    {usersList.slice(0, 3).map((user) => (
                      <div key={user.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-[#FF4D6D]/10 text-[#FF4D6D] rounded-full flex items-center justify-center font-bold text-xs select-none">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#1F2937] block">{user.name}</span>
                            <span className="text-[10px] text-[#6B7280] block font-mono">{user.email}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate font-bold font-mono">
                          {user.createdAt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MEMBERS MANAGEMENT PANEL */}
          {activeTab === "users" && (
            <div className="bg-white border border-[#EAEAEA] rounded-[24px] shadow-xs text-left animate-in fade-in duration-300">

              {/* Header Title toolbar */}
              <div className="px-6 py-5 border-b border-[#EAEAEA] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="font-black text-lg text-[#1F2937]">Quản lý thành viên</h2>
                  <p className="text-[#6B7280] text-xs">Quản lý phân quyền, tình trạng hoạt động và thông tin xác thực.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setIsAddUserOpen(true)}
                    className="flex items-center gap-2 bg-[#FF4D6D] hover:bg-[#FF335C] text-white font-bold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer shadow-md"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Thêm thành viên</span>
                  </button>
                </div>
              </div>

              {/* Data Table Toolbars */}
              <div className="p-4 bg-[#FAFAFA] border-b border-[#EAEAEA] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search box input */}
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7280]" />
                    <input
                      type="text"
                      placeholder="Tìm ID, Tên, Email..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="w-full bg-white border border-[#EAEAEA] rounded-xl py-2 pl-9 pr-4 text-xs text-[#1F2937] outline-none focus:border-[#FF4D6D] transition"
                    />
                  </div>

                  {/* Filter role */}
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="border border-[#EAEAEA] bg-white rounded-xl px-3 py-2 text-xs text-[#6B7280] font-semibold outline-none"
                  >
                    <option value="all">Mọi vai trò</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                  </select>

                  {/* Filter status */}
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    className="border border-[#EAEAEA] bg-white rounded-xl px-3 py-2 text-xs text-[#6B7280] font-semibold outline-none"
                  >
                    <option value="all">Mọi trạng thái</option>
                    <option value="Active">Hoạt động</option>
                    <option value="Blocked">Bị khóa</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      setUserSearchQuery("");
                      setUserRoleFilter("all");
                      setUserStatusFilter("all");
                      setIsLoading(true);
                      try {
                        const remoteUsers = await apiClient.fetchAdminUsers("", 1, 100);
                        if (remoteUsers && remoteUsers.length > 0) {
                          setUsersList(remoteUsers);
                          toast.success("Đã đồng bộ thành viên mới nhất!");
                        } else {
                          toast.info("Cài lại bộ lọc thành công.");
                        }
                      } catch (e: any) {
                        toast.error(e.message || "Đồng bộ thành viên thất bại.");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    className="p-2.5 border border-[#EAEAEA] hover:bg-gray-50 text-[#6B7280] rounded-xl transition cursor-pointer"
                    title="Đồng bộ & Làm mới bộ lọc"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toast.success("Đang xuất tập tin Excel thành viên...")}
                    className="flex items-center gap-1.5 border border-[#EAEAEA] hover:bg-gray-50 text-[#1F2937] text-xs font-semibold px-3 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Xuất dữ liệu</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] text-[#6B7280] font-bold uppercase tracking-wider border-b border-[#EAEAEA]">
                      <th className="p-4">Thành viên</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Vai trò</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-[#6B7280] font-medium space-y-1">
                          <p>Không tìm thấy thành viên nào trùng khớp.</p>
                          <p className="text-[11px] font-normal">Hãy thử điều chỉnh lại từ khóa hoặc bộ lọc tìm kiếm của bạn.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const isActive = user.status === "Active";
                        const isAdmin = user.role === "Admin";
                        return (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition">
                            <td className="p-4 flex items-center gap-3">
                              <div className="h-9 w-9 bg-[#FF4D6D]/10 text-[#FF4D6D] rounded-full flex items-center justify-center font-bold text-xs select-none">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-[#1F2937] block">{user.name}</span>
                                <span className="text-[9px] text-[#6B7280] font-mono block">ID: {user.id}</span>
                              </div>
                            </td>
                            <td className="p-4 font-medium text-[#6B7280]">
                              <span className="block">{user.email}</span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isAdmin ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                }`}>
                                {isActive ? "Hoạt động" : "Bị khóa"}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                      const detail = await apiClient.fetchAdminUserById(user.id);
                                      if (detail) {
                                        setUserToEdit(detail);
                                        setIsEditUserOpen(true);
                                      } else {
                                        setUserToEdit(user);
                                        setIsEditUserOpen(true);
                                      }
                                    } catch (err: any) {
                                      console.warn(err);
                                      setUserToEdit(user);
                                      setIsEditUserOpen(true);
                                    } finally {
                                      setIsLoading(false);
                                    }
                                  }}
                                  className="p-2 border border-[#EAEAEA] hover:border-slate hover:bg-gray-50 text-[#6B7280] rounded-xl transition cursor-pointer"
                                  title="Chỉnh sửa thông tin"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleToggleUserStatus(user.id)}
                                  className={`p-2 border rounded-xl transition cursor-pointer ${isActive ? "bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100"
                                    }`}
                                  title={isActive ? "Khóa tài khoản" : "Kích hoạt tài khoản"}
                                >
                                  {isActive ? <Ban className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteUserClick(user.id)}
                                  className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                                  title="Xóa tài khoản vĩnh viễn"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCTS/LISTINGS MODERATION PANEL */}
          {activeTab === "products" && (
            <div className="bg-white border border-[#EAEAEA] rounded-[24px] shadow-xs text-left animate-in fade-in duration-300">
              <div className="px-6 py-5 border-b border-[#EAEAEA] flex items-center justify-between">
                <div>
                  <h2 className="font-black text-lg text-[#1F2937]">Kiểm duyệt tin đăng</h2>
                  <p className="text-[#6B7280] text-xs">Kiểm duyệt và phê duyệt tin đăng trao đổi mới từ cộng đồng Swaply.</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-[#FAFAFA] border border-[#EAEAEA] text-[#6B7280] rounded-xl">
                  {pendingListings.length} tin chờ duyệt
                </span>
              </div>

              {/* Listings Search Toolbars */}
              <div className="p-4 bg-[#FAFAFA] border-b border-[#EAEAEA] flex items-center justify-between">
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6B7280]" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tiêu đề hoặc người đăng..."
                    value={listingSearchQuery}
                    onChange={(e) => setListingSearchQuery(e.target.value)}
                    className="w-full bg-white border border-[#EAEAEA] rounded-xl py-2 pl-9 pr-4 text-xs text-[#1F2937] outline-none focus:border-[#FF4D6D] transition"
                  />
                </div>
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    await onReloadData();
                    toast.success("Làm mới danh sách tin đăng.");
                    setIsLoading(false);
                  }}
                  className="p-2 border border-[#EAEAEA] bg-white rounded-xl hover:bg-gray-50 text-[#6B7280] transition"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              {filteredListings.length === 0 ? (
                <div className="py-20 text-center text-[#6B7280] space-y-2">
                  <p className="text-sm font-bold text-[#1F2937]">Hộp thư kiểm duyệt trống.</p>
                  <p className="text-xs max-w-xs mx-auto text-[#6B7280]">Tất cả tin đăng trao đổi đều đã được kiểm duyệt xong!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAFAFA] text-[#6B7280] font-bold uppercase tracking-wider border-b border-[#EAEAEA]">
                        <th className="p-4 w-1/3">Sản phẩm cần đổi</th>
                        <th className="p-4">Danh mục</th>
                        <th className="p-4">Trạng thái</th>
                        <th className="p-4 text-right">Ước tính giá trị</th>
                        <th className="p-4 text-center">Thao tác duyệt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA]">
                      {filteredListings.map((prop) => (
                        <tr key={prop.id} className="hover:bg-gray-50/50 transition">
                          <td className="p-4 flex items-center gap-3">
                            <div className="h-11 w-11 rounded-lg overflow-hidden shrink-0 border border-[#EAEAEA] bg-[#FAFAFA] flex items-center justify-center">
                              {prop.images?.[0] ? (
                                <img src={prop.images[0]} alt={prop.title} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-[8px] text-[#6B7280] font-bold select-none">NO IMG</span>
                              )}
                            </div>
                            <div className="space-y-0.5 min-w-0">
                              <span className="font-bold text-[#1F2937] block text-sm line-clamp-1">{prop.title}</span>
                              <span className="text-[10px] text-[#6B7280] block font-medium">Người đăng: {prop.ownerName}</span>
                            </div>
                          </td>
                          <td className="p-4 font-bold text-[#6B7280]">{prop.categoryName || prop.category}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 font-bold text-[10px] uppercase">
                              Chờ duyệt
                            </span>
                          </td>
                          <td className="p-4 font-black text-emerald-600 text-right text-sm">
                            {(prop.estimatedValue || prop.price || 0).toLocaleString("vi-VN")} đ
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewListingDetail(prop.id)}
                                className="p-2 border border-[#EAEAEA] hover:border-slate hover:bg-gray-50 text-[#6B7280] rounded-xl transition cursor-pointer"
                                title="Xem chi tiết"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(prop.id, "Active")}
                                className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 rounded-xl transition cursor-pointer"
                                title="Phê duyệt cho hiển thị"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(prop.id, "Rejected")}
                                className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-600 rounded-xl transition cursor-pointer"
                                title="Từ chối tin đăng"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteListing(prop.id)}
                                className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                                title="Xóa tin đăng khỏi hệ thống"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CATEGORY PANEL */}
          {activeTab === "categories" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-in fade-in duration-300">

              {/* Left Column: Create new Category form */}
              <div className="lg:col-span-4 bg-white border border-[#EAEAEA] rounded-[24px] p-6 shadow-xs h-fit space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-[#FF4D6D]/10 flex items-center justify-center text-[#FF4D6D]">
                    <Plus className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1F2937] uppercase tracking-wide">Thêm danh mục mới</h3>
                    <p className="text-[10px] text-[#6B7280]">Tạo một nhóm đồ dùng mới để người dùng lựa chọn khi đăng bài.</p>
                  </div>
                </div>

                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Tên danh mục</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Đồ gia dụng, Thời trang trẻ em..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-4 py-3 text-xs text-[#1F2937] outline-none focus:border-[#FF4D6D] transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Mô tả ngắn</label>
                    <textarea
                      rows={3}
                      placeholder="Mô tả tóm tắt..."
                      value={newCategoryDesc}
                      onChange={(e) => setNewCategoryDesc(e.target.value)}
                      className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-4 py-3 text-xs text-[#1F2937] outline-none focus:border-[#FF4D6D] transition resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#FF4D6D] hover:bg-[#FF335C] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer active:scale-95"
                  >
                    Tạo danh mục ngay
                  </button>
                </form>
              </div>

              {/* Right Column: Categories List table */}
              <div className="lg:col-span-8 bg-white border border-[#EAEAEA] rounded-[24px] shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-[#EAEAEA] flex items-center justify-between bg-white">
                  <h3 className="font-bold text-sm text-[#1F2937]">Danh sách danh mục đang có</h3>
                  <span className="text-xs font-bold px-3 py-1 bg-[#FAFAFA] border border-[#EAEAEA] text-[#6B7280] rounded-xl">
                    {categoryRows.length} danh mục
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAFAFA] text-[#6B7280] font-bold uppercase tracking-wider border-b border-[#EAEAEA]">
                        <th className="p-4 w-1/3">Tên danh mục</th>
                        <th className="p-4">Mô tả</th>
                        <th className="p-4 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA]">
                      {categoryRows.map((cat) => (
                        <tr key={cat.id} className="hover:bg-gray-50/50 transition">
                          <td className="p-4 font-bold text-[#1F2937]">{cat.name}</td>
                          <td className="p-4 font-medium text-[#6B7280] max-w-xs truncate">{cat.description || "N/A"}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenCategoryDetail(cat.id, cat.name)}
                                className="p-2 border border-[#EAEAEA] hover:border-slate hover:bg-gray-50 text-[#6B7280] rounded-xl transition cursor-pointer"
                                title="Xem chi tiết"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditCategory(cat)}
                                className="p-2 border border-[#EAEAEA] hover:border-slate hover:bg-gray-50 text-[#6B7280] rounded-xl transition cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                                title="Xóa danh mục"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: EXCHANGE REQUESTS PANEL */}
          {activeTab === "requests" && (
            <div className="bg-white border border-[#EAEAEA] rounded-[24px] shadow-xs text-left animate-in fade-in duration-300 p-6 space-y-4">
              <div className="border-b border-[#EAEAEA] pb-4">
                <h2 className="font-black text-lg text-[#1F2937]">Quản lý yêu cầu trao đổi</h2>
                <p className="text-[#6B7280] text-xs">Theo dõi và giải quyết tranh chấp phát sinh trong quá trình trao đổi đồ.</p>
              </div>

              <div className="py-20 text-center text-[#6B7280] space-y-3 max-w-md mx-auto">
                <div className="h-12 w-12 rounded-full bg-[#FF4D6D]/10 text-[#FF4D6D] flex items-center justify-center mx-auto">
                  <GitPullRequest className="h-6 w-6" />
                </div>
                <p className="text-sm font-bold text-[#1F2937]">Không có yêu cầu khiếu nại tranh chấp nào.</p>
                <p className="text-xs text-[#6B7280]">Toàn bộ các đề xuất trao đổi trực tuyến đang được thực hiện suôn sẻ theo đúng thỏa thuận của các bên.</p>
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS & DISPUTES */}
          {activeTab === "reports" && (
            <div className="bg-white border border-[#EAEAEA] rounded-[24px] shadow-xs text-left animate-in fade-in duration-300 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-4">
                <div>
                  <h2 className="font-black text-lg text-[#1F2937]">Báo cáo vi phạm và Khiếu nại</h2>
                  <p className="text-[#6B7280] text-xs">Xét duyệt tin đăng rác, lừa đảo, hoặc sản phẩm giả mạo bị báo cáo từ người dùng.</p>
                </div>
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const reps = await apiClient.fetchAdminReports(1, 100);
                      setReportsList(reps);
                      toast.success("Đã cập nhật danh sách báo cáo!");
                    } catch (e: any) {
                      toast.error("Không thể tải danh sách báo cáo.");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="flex items-center gap-1.5 border border-[#EAEAEA] hover:bg-gray-50 text-[#1F2937] font-semibold text-xs py-2 px-3 rounded-xl transition cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3 text-[#6B7280]" />
                  <span>Cập nhật</span>
                </button>
              </div>

              {reportsList.length === 0 ? (
                <div className="py-20 text-center text-[#6B7280] space-y-3 max-w-md mx-auto">
                  <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-bold text-[#1F2937]">Danh sách báo cáo trống.</p>
                  <p className="text-xs text-[#6B7280]">Chúc mừng! Cộng đồng người dùng Swaply đang giữ mức độ tương tác rất trong sạch.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAFAFA] text-[#6B7280] font-bold uppercase tracking-wider border-b border-[#EAEAEA]">
                        <th className="p-4">Người báo cáo</th>
                        <th className="p-4">Đối tượng bị báo cáo</th>
                        <th className="p-4">Lý do</th>
                        <th className="p-4">Nội dung chi tiết</th>
                        <th className="p-4">Ngày gửi</th>
                        <th className="p-4 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA]">
                      {reportsList.map((rep) => (
                        <tr key={rep.id} className="hover:bg-[#FAFAFA]/50 transition">
                          <td className="p-4 font-bold text-[#1F2937]">{rep.reporterName}</td>
                          <td className="p-4 font-semibold text-rose-600">{rep.targetName}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                              {rep.reason}
                            </span>
                          </td>
                          <td className="p-4 max-w-[280px] truncate text-[#6B7280]" title={rep.description}>
                            {rep.description}
                          </td>
                          <td className="p-4 text-[#6B7280]">{rep.createdAt}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={async () => {
                                  if (confirm(`Bạn có chắc chắn muốn KHÓA tài khoản ${rep.targetName} bị báo cáo?`)) {
                                    setIsLoading(true);
                                    try {
                                      await apiClient.lockUser(rep.targetId);
                                      toast.success(`Đã khóa thành công tài khoản ${rep.targetName}!`);
                                      setUsersList(usersList.map(u => u.id === rep.targetId ? { ...u, status: "Blocked" } : u));
                                    } catch (e: any) {
                                      toast.error("Không thể khóa tài khoản.");
                                    } finally {
                                      setIsLoading(false);
                                    }
                                  }
                                }}
                                className="p-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 rounded-xl transition cursor-pointer animate-none"
                                title="Khóa tài khoản vi phạm"
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={async () => {
                                  setIsLoading(true);
                                  try {
                                    await apiClient.approveAdminReport(rep.id, "Đã xử lý báo cáo");
                                    setReportsList(reportsList.filter((r) => r.id !== rep.id));
                                    toast.success("Đã duyệt và xử lý báo cáo vi phạm.");
                                  } catch (e: any) {
                                    toast.error(e?.message || "Không thể duyệt báo cáo.");
                                  } finally {
                                    setIsLoading(false);
                                  }
                                }}
                                className="p-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-600 rounded-xl transition cursor-pointer"
                                title="Duyệt báo cáo"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: SETTINGS PANEL */}
          {activeTab === "settings" && (
            <div className="bg-white border border-[#EAEAEA] rounded-[24px] shadow-xs text-left animate-in fade-in duration-300 p-6 space-y-6">
              <div className="border-b border-[#EAEAEA] pb-4">
                <h2 className="font-black text-lg text-[#1F2937]">Cài đặt hệ thống</h2>
                <p className="text-[#6B7280] text-xs">Cấu hình tham số dịch vụ Swaply Barter Marketplace.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="space-y-2.5">
                  <h3 className="font-bold text-sm text-[#1F2937]">Thông tin chung</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Tên cổng Admin</label>
                      <input type="text" defaultValue="Swaply Barter Portal" className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-4 py-2.5 text-xs text-[#1F2937] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Email liên hệ phản hồi</label>
                      <input type="email" defaultValue="support@swaply.vn" className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-4 py-2.5 text-xs text-[#1F2937] outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h3 className="font-bold text-sm text-[#1F2937]">Chính sách & Phí</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Phí dịch vụ mặc định</label>
                      <input type="text" defaultValue="0 đ (Miễn phí)" className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-4 py-2.5 text-xs text-[#1F2937] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Phí đẩy tin Premium</label>
                      <input type="text" defaultValue="20.000 đ / ngày" className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-4 py-2.5 text-xs text-[#1F2937] outline-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAEAEA]">
                <button
                  onClick={() => toast.success("Đã lưu các cấu hình cài đặt mới!")}
                  className="bg-[#FF4D6D] hover:bg-[#FF335C] text-white font-bold py-2.5 px-6 rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  Lưu cấu hình
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* 4. MODALS & FORMS DRAWER */}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[420px] bg-white border border-[#EAEAEA] shadow-2xl rounded-3xl p-6 space-y-5 text-left animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-base text-[#1F2937]">Tạo tài khoản thành viên mới</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Họ tên *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] outline-none focus:border-[#FF4D6D] transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Tên đăng nhập (Username) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: nickname123"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] outline-none focus:border-[#FF4D6D] transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Địa chỉ Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] outline-none focus:border-[#FF4D6D] transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Số điện thoại</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 098..."
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] outline-none focus:border-[#FF4D6D] transition"
                />
              </div>



              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="flex-1 border border-[#EAEAEA] hover:bg-gray-50 text-[#6B7280] font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FF4D6D] hover:bg-[#FF335C] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  Thêm thành viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserOpen && userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[420px] bg-white border border-[#EAEAEA] shadow-2xl rounded-3xl p-6 space-y-5 text-left animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-base text-[#1F2937]">Chỉnh sửa thông tin thành viên</h3>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Họ tên</label>
                <input
                  type="text"
                  required
                  value={userToEdit.name}
                  onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Địa chỉ Email</label>
                <input
                  type="email"
                  required
                  value={userToEdit.email}
                  onChange={(e) => setUserToEdit({ ...userToEdit, email: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Số điện thoại</label>
                <input
                  type="text"
                  value={userToEdit.phone}
                  onChange={(e) => setUserToEdit({ ...userToEdit, phone: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] outline-none"
                />
              </div>



              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Trạng thái</label>
                <select
                  value={userToEdit.status}
                  onChange={(e) => setUserToEdit({ ...userToEdit, status: e.target.value })}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-3 py-2.5 text-xs text-[#6B7280] font-semibold outline-none"
                >
                  <option value="Active">Hoạt động</option>
                  <option value="Blocked">Bị khóa</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditUserOpen(false)}
                  className="flex-1 border border-[#EAEAEA] hover:bg-gray-50 text-[#6B7280] font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FF4D6D] hover:bg-[#FF335C] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Permanent Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[380px] bg-white border border-[#EAEAEA] shadow-2xl rounded-3xl p-6 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-sm text-[#1F2937]">Xác nhận xóa tài khoản</h3>
              <p className="text-[#6B7280] text-xs">Hành động này sẽ xóa vĩnh viễn tài khoản và các dữ liệu liên quan khỏi hệ thống.</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 border border-[#EAEAEA] hover:bg-gray-50 text-[#6B7280] font-bold py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 bg-[#FF4D6D] hover:bg-[#FF335C] text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer shadow-md"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isCategoryEditOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[420px] bg-white border border-[#EAEAEA] shadow-2xl rounded-3xl p-6 space-y-5 text-left animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-base text-[#1F2937]">Chỉnh sửa danh mục</h3>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Tên danh mục</label>
                <input
                  type="text"
                  required
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Mô tả chi tiết</label>
                <textarea
                  rows={3}
                  value={editCategoryDescription}
                  onChange={(e) => setEditCategoryDescription(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-xl px-3 py-2.5 text-xs text-[#1F2937] outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCategoryEditOpen(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 border border-[#EAEAEA] hover:bg-gray-50 text-[#6B7280] font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FF4D6D] hover:bg-[#FF335C] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  Lưu cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Detail View Modal */}
      {isCategoryDetailOpen && selectedCategoryDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[400px] bg-white border border-[#EAEAEA] shadow-2xl rounded-3xl p-6 space-y-4 text-left animate-in zoom-in-95 duration-200">
            <div className="h-10 w-10 rounded-2xl bg-[#FF4D6D]/10 text-[#FF4D6D] flex items-center justify-center">
              <Tags className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black text-sm text-[#1F2937]">{selectedCategoryDetail.name}</h3>
              <p className="text-[10px] text-[#6B7280] font-mono">Mã danh mục: {selectedCategoryDetail.id}</p>
            </div>
            <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-3 rounded-xl">
              <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Mô tả tóm tắt</span>
              <p className="text-xs text-[#1F2937] leading-relaxed">{selectedCategoryDetail.description || "N/A"}</p>
            </div>
            <button
              onClick={() => {
                setIsCategoryDetailOpen(false);
                setSelectedCategoryDetail(null);
              }}
              className="w-full border border-[#EAEAEA] hover:bg-gray-50 text-[#1F2937] font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
            >
              Đóng chi tiết
            </button>
          </div>
        </div>
      )}

      {/* Listing Detail View Modal */}
      {isListingDetailOpen && selectedListingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[600px] bg-white border border-[#EAEAEA] shadow-2xl rounded-3xl p-6 space-y-5 text-left animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-base text-[#1F2937] line-clamp-2">{selectedListingDetail.title}</h3>
                <p className="text-[10px] text-[#6B7280] font-mono mt-1">Mã tin đăng: {selectedListingDetail.id}</p>
              </div>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 font-bold text-[10px] uppercase shrink-0">
                Chờ duyệt
              </span>
            </div>

            {selectedListingDetail.images && selectedListingDetail.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                {selectedListingDetail.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={selectedListingDetail.title}
                    className="h-28 w-28 rounded-xl object-cover border border-[#EAEAEA] shrink-0 bg-gray-50"
                    onError={(e) => {
                      (e.target as any).src = "https://images.unsplash.com/photo-1594122230689-486b7d986d4c?w=150";
                    }}
                  />
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-3 rounded-xl">
                <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Người đăng</span>
                <p className="font-bold text-[#1F2937]">{selectedListingDetail.ownerName || "Không rõ"}</p>
              </div>
              <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-3 rounded-xl">
                <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Danh mục</span>
                <p className="font-bold text-[#1F2937]">{selectedListingDetail.categoryName || selectedListingDetail.category || "Không rõ"}</p>
              </div>
              <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-3 rounded-xl">
                <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Giá trị ước lượng</span>
                <p className="font-bold text-emerald-600">{(selectedListingDetail.estimatedValue || selectedListingDetail.price || 0).toLocaleString("vi-VN")} đ</p>
              </div>
              <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-3 rounded-xl">
                <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Khu vực</span>
                <p className="font-bold text-[#1F2937]">{selectedListingDetail.location || "Chưa cập nhật"}</p>
              </div>
            </div>

            <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-3 rounded-xl text-xs space-y-1">
              <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Mô tả chi tiết</span>
              <p className="text-[#1F2937] leading-relaxed whitespace-pre-wrap">{selectedListingDetail.description || "Không có mô tả."}</p>
            </div>

            {selectedListingDetail.amenities && selectedListingDetail.amenities.length > 0 && (
              <div className="bg-[#FAFAFA] border border-[#EAEAEA] p-3 rounded-xl text-xs space-y-1">
                <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Tiện ích / Tình trạng</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedListingDetail.amenities.map((item, idx) => (
                    <span key={idx} className="bg-white border border-[#EAEAEA] px-2 py-0.5 rounded text-[10px] text-[#1F2937] font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setIsListingDetailOpen(false);
                  setSelectedListingDetail(null);
                }}
                className="flex-1 border border-[#EAEAEA] hover:bg-gray-50 text-[#1F2937] font-bold py-2.5 rounded-xl text-xs transition cursor-pointer text-center"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  const id = selectedListingDetail.id;
                  setIsListingDetailOpen(false);
                  setSelectedListingDetail(null);
                  handleUpdateStatus(id, "Active");
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer text-center"
              >
                Phê duyệt
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && <Loader message="Đang xử lý nghiệp vụ..." />}
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Trash2, Loader2, Check, X, Ban, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { useRouter } from "@shared/context/RouterContext";
import { apiClient } from "@shared/api/apiClient";
import { toast } from "react-toastify";

interface ChatPageProps {
  currentUser: { id: string; name: string; email: string; avatar: string; isPremium: boolean } | null;
}

export default function ChatPage({ currentUser }: ChatPageProps) {
  const { navigate } = useRouter();
  
  // State variables
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  // Exchange Proposal states
  const [exchangeDetails, setExchangeDetails] = useState<any | null>(null);
  const [loadingExchange, setLoadingExchange] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [proposerListing, setProposerListing] = useState<any | null>(null);
  const [receiverListing, setReceiverListing] = useState<any | null>(null);

  // Dynamic user profiles & listing previews caches
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});
  const [listingPreviews, setListingPreviews] = useState<Record<string, any>>({});

  // Local conversation hide list
  const [hiddenConvoIds, setHiddenConvoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("swaply_hidden_conversations");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleDeleteConversation = () => {
    if (!activeConversation) return;
    if (!confirm("Bạn có chắc chắn muốn xóa cuộc trò chuyện này không?")) return;

    const newHidden = [...hiddenConvoIds, activeConversation.id];
    setHiddenConvoIds(newHidden);
    localStorage.setItem("swaply_hidden_conversations", JSON.stringify(newHidden));
    
    toast.success("Đã xóa cuộc trò chuyện.");
    
    // Auto-select another conversation or null
    const nextConvo = conversations.find(c => c.id !== activeConversation.id && !newHidden.includes(c.id));
    setActiveConversation(nextConvo || null);
  };

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Helper to validate and fallback broken/placeholder avatars
  const getAvatarUrl = (user: any) => {
    const avatar = user?.avatar || user?.avatarUrl;
    if (!avatar || avatar === "string" || avatar.trim() === "" || avatar.includes("placeholder") || avatar.startsWith("http://localhost:5191/placeholder")) {
      return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
    }
    return avatar;
  };

  // Dynamically resolve other user details (from cache, local storage, or fallback)
  const getOtherUser = (convo: any) => {
    const otherId = getOtherParticipantId(convo);
    if (!otherId) return { name: "Thành viên", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80" };
    if (userProfiles[otherId]) {
      return userProfiles[otherId];
    }
    return getUserDetails(otherId);
  };

  // Helper to resolve user names and avatars
  const getUserDetails = (userId: string) => {
    try {
      const storedUsers = localStorage.getItem("swaply_users");
      if (storedUsers) {
        const list = JSON.parse(storedUsers);
        const match = list.find((u: any) => u.id === userId);
        if (match) return match;
      }
    } catch (e) {}

    // Fallbacks based on typical ID formats
    if (userId === "user-1") return { name: "Nguyễn Minh Quang", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80" };
    if (userId === "user-2") return { name: "Trần Thị Lan", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80" };
    if (userId === "user-3") return { name: "Lê Hoàng Nam", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" };
    if (userId === "admin-id") return { name: "Hồ Đăng Quang", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80" };

    return {
      name: "Thành viên",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"
    };
  };

  // 1. Fetch Conversations on Mount
  const loadConversations = async (selectId?: string) => {
    if (!currentUser) return;
    try {
      const list = await apiClient.fetchConversations();
      setConversations(list);

      // Check if we have an active conversation passed via redirect state
      const redirectId = selectId || sessionStorage.getItem("swaply_active_conversation_id");
      if (redirectId) {
        const matched = list.find((c) => c.id === redirectId);
        if (matched) {
          setActiveConversation(matched);
          sessionStorage.removeItem("swaply_active_conversation_id");
        } else {
          // If not in the list yet, fetch detail and select it
          try {
            const detail = await apiClient.fetchConversationById(redirectId);
            if (detail) {
              setConversations((prev) => [detail, ...prev]);
              setActiveConversation(detail);
            }
          } catch (e) {
            console.warn(e);
          }
          sessionStorage.removeItem("swaply_active_conversation_id");
        }
      } else if (list.length > 0 && !activeConversation) {
        // Default to first conversation
        setActiveConversation(list[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [currentUser]);

  // 2. Fetch Messages when Active Conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchConvoMessages = async () => {
      try {
        const list = await apiClient.fetchMessages(activeConversation.id);
        setMessages(list);
      } catch (e) {
        console.error(e);
      }
    };

    fetchConvoMessages();

    // Setup periodic polling for new messages every 3 seconds
    const interval = setInterval(fetchConvoMessages, 3000);
    return () => clearInterval(interval);
  }, [activeConversation]);

  // 3. Fetch Exchange details if related
  useEffect(() => {
    if (!activeConversation) {
      setExchangeDetails(null);
      setProposerListing(null);
      setReceiverListing(null);
      return;
    }

    const loadExchange = async () => {
      setLoadingExchange(true);
      try {
        let details = null;
        if (activeConversation.relatedExchangeId) {
          details = await apiClient.fetchExchangeById(activeConversation.relatedExchangeId);
        } else {
          // Fallback: search exchanges list for a match between these two users
          const otherId = getOtherParticipantId(activeConversation);
          if (otherId) {
            const list = await apiClient.fetchExchanges();
            // Find exchange between currentUser.id and otherId
            const match = list.find(
              (ex: any) =>
                (ex.proposerId?.toLowerCase() === currentUser.id.toLowerCase() && ex.receiverId?.toLowerCase() === otherId.toLowerCase()) ||
                (ex.proposerId?.toLowerCase() === otherId.toLowerCase() && ex.receiverId?.toLowerCase() === currentUser.id.toLowerCase())
            );
            if (match) {
              details = match;
            }
          }
        }

        setExchangeDetails(details);
        
        if (details) {
          // Fetch proposer and receiver listing details
          const [propList, recvList] = await Promise.all([
            apiClient.fetchListingById(details.proposerListingId).catch(() => null),
            apiClient.fetchListingById(details.receiverListingId).catch(() => null)
          ]);
          setProposerListing(propList);
          setReceiverListing(recvList);
        } else {
          setProposerListing(null);
          setReceiverListing(null);
        }
      } catch (e) {
        console.warn("Could not load exchange details:", e);
        setExchangeDetails(null);
        setProposerListing(null);
        setReceiverListing(null);
      } finally {
        setLoadingExchange(false);
      }
    };

    loadExchange();
  }, [activeConversation]);

  // Fetch participant profiles for loaded conversations
  useEffect(() => {
    if (conversations.length === 0) return;

    const fetchProfiles = async () => {
      const idsToFetch = conversations
        .map((convo) => getOtherParticipantId(convo))
        .filter((id) => id && !userProfiles[id]);

      if (idsToFetch.length === 0) return;

      const newProfiles = { ...userProfiles };
      await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const user = await apiClient.fetchAdminUserById(id);
            if (user) {
              newProfiles[id] = user;
            }
          } catch (e) {
            console.warn(`Could not load profile for user ${id}:`, e);
          }
        })
      );
      setUserProfiles(newProfiles);
    };

    fetchProfiles();
  }, [conversations]);

  // Fetch listing previews for loaded conversations
  useEffect(() => {
    if (conversations.length === 0) return;

    const fetchListings = async () => {
      const idsToFetch = conversations
        .map((convo) => convo.relatedListingId)
        .filter((id) => id && !listingPreviews[id]);

      if (idsToFetch.length === 0) return;

      const newListings = { ...listingPreviews };
      await Promise.all(
        idsToFetch.map(async (id) => {
          try {
            const listing = await apiClient.fetchListingById(id);
            if (listing) {
              newListings[id] = listing;
            }
          } catch (e) {
            console.warn(`Could not load listing preview for ${id}:`, e);
          }
        })
      );
      setListingPreviews(newListings);
    };

    fetchListings();
  }, [conversations]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message Handler
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation || isSending) return;

    setIsSending(true);
    const content = inputText.trim();
    setInputText("");

    try {
      const response = await apiClient.sendMessage(activeConversation.id, content);
      setMessages((prev) => [...prev, response]);
    } catch (err: any) {
      toast.error(err.message || "Không thể gửi tin nhắn.");
      setInputText(content); // restore input
    } finally {
      setIsSending(false);
    }
  };

  // 5. Exchange Proposal Actions
  const handleAcceptExchange = async () => {
    if (!exchangeDetails || actionLoading) return;
    if (!confirm("Bạn có chắc chắn muốn chấp nhận đề xuất trao đổi này không?")) return;

    setActionLoading(true);
    try {
      await apiClient.acceptExchange(exchangeDetails.id);
      toast.success("Chấp nhận đề xuất trao đổi thành công!");
      // Reload exchange details
      const details = await apiClient.fetchExchangeById(exchangeDetails.id);
      setExchangeDetails(details);
    } catch (e: any) {
      toast.error(e.message || "Chấp nhận trao đổi thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectExchange = async () => {
    if (!exchangeDetails || actionLoading) return;
    if (!confirm("Bạn có chắc chắn muốn từ chối đề xuất trao đổi này không?")) return;

    setActionLoading(true);
    try {
      await apiClient.rejectExchange(exchangeDetails.id);
      toast.success("Đã từ chối đề xuất trao đổi.");
      // Reload exchange details
      const details = await apiClient.fetchExchangeById(exchangeDetails.id);
      setExchangeDetails(details);
    } catch (e: any) {
      toast.error(e.message || "Từ chối trao đổi thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelExchange = async () => {
    if (!exchangeDetails || actionLoading) return;
    if (!confirm("Bạn có chắc chắn muốn hủy yêu cầu trao đổi này không?")) return;

    setActionLoading(true);
    try {
      await apiClient.cancelExchange(exchangeDetails.id);
      toast.success("Đã hủy đề xuất trao đổi.");
      // Reload exchange details
      const details = await apiClient.fetchExchangeById(exchangeDetails.id);
      setExchangeDetails(details);
    } catch (e: any) {
      toast.error(e.message || "Hủy đề xuất thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteExchange = async () => {
    if (!exchangeDetails || actionLoading) return;
    if (!confirm("Bạn xác nhận giao dịch trao đổi đã hoàn tất thành công?")) return;

    setActionLoading(true);
    try {
      await apiClient.completeExchange(exchangeDetails.id);
      toast.success("Chúc mừng! Đã hoàn tất giao dịch trao đổi.");
      // Reload exchange details
      const details = await apiClient.fetchExchangeById(exchangeDetails.id);
      setExchangeDetails(details);
    } catch (e: any) {
      toast.error(e.message || "Hoàn tất trao đổi thất bại.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 py-12 text-center space-y-4">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-100">
          <Ban className="h-8 w-8" />
        </div>
        <h3 className="font-bold text-carbon text-lg">Yêu cầu đăng nhập</h3>
        <p className="text-slate text-sm max-w-sm mx-auto">Vui lòng đăng nhập tài khoản Swaply của bạn để sử dụng chức năng nhắn tin thương lượng.</p>
        <button onClick={() => navigate("home")} className="bg-brand-coral hover:bg-brand-deep text-cloud px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md cursor-pointer">
          Quay lại trang chủ
        </button>
      </main>
    );
  }

  // Get other participant ID from active conversation
  const getOtherParticipantId = (convo: any) => {
    if (!convo || !currentUser?.id) return "";
    const currentId = currentUser.id.toLowerCase();
    
    // 1. check participantIds array
    if (Array.isArray(convo.participantIds)) {
      const match = convo.participantIds.find((id: string) => id && id.toLowerCase() !== currentId);
      if (match) return match;
    }
    
    // 2. check participants array
    if (Array.isArray(convo.participants)) {
      const match = convo.participants.find((p: any) => {
        const id = typeof p === "string" ? p : p.id || p.userId;
        return id && id.toLowerCase() !== currentId;
      });
      if (match) {
        return typeof match === "string" ? match : match.id || match.userId || "";
      }
    }
    
    // 3. check specific fields
    if (convo.user1Id && convo.user1Id.toLowerCase() !== currentId) return convo.user1Id;
    if (convo.user2Id && convo.user2Id.toLowerCase() !== currentId) return convo.user2Id;
    if (convo.receiverId && convo.receiverId.toLowerCase() !== currentId) return convo.receiverId;
    if (convo.proposerId && convo.proposerId.toLowerCase() !== currentId) return convo.proposerId;
    if (convo.otherUserId) return convo.otherUserId;

    return "";
  };

  return (
    <main className="flex-1 w-full max-w-[1100px] mx-auto px-6 py-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[500px]">
      
      {/* 1. Left Pane: Conversations List */}
      <div className="w-full md:w-80 bg-cloud border border-mist rounded-[24px] p-4 flex flex-col shrink-0 text-left shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-carbon text-xs uppercase tracking-wider">Hộp thư tin nhắn</h3>
          <button 
            onClick={() => {
              setLoadingList(true);
              loadConversations();
            }}
            className="p-1.5 hover:bg-fog rounded-full text-slate transition cursor-pointer"
            title="Làm mới hộp thư"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {loadingList ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-brand-coral animate-spin" />
          </div>
        ) : (() => {
            const seen = new Set<string>();
            return conversations
              .filter((c) => !hiddenConvoIds.includes(c.id))
              .filter((convo) => {
                const otherId = getOtherParticipantId(convo);
                const listingId = convo.relatedListingId || "";
                const key = `${otherId}_${listingId}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
              });
          })().length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate space-y-2">
            <p className="text-xs font-bold text-carbon">Hộp thư trống</p>
            <p className="text-[10px] text-slate">Bạn chưa có cuộc trò chuyện nào. Hãy gửi đề xuất trao đổi để kết nối ngay!</p>
          </div>
        ) : (
          <div className="space-y-1.5 overflow-y-auto no-scrollbar flex-1">
            {(() => {
              const seen = new Set<string>();
              return conversations
                .filter((c) => !hiddenConvoIds.includes(c.id))
                .filter((convo) => {
                  const otherId = getOtherParticipantId(convo);
                  const listingId = convo.relatedListingId || "";
                  const key = `${otherId}_${listingId}`;
                  if (seen.has(key)) return false;
                  seen.add(key);
                  return true;
                });
            })().map((convo) => {
              const otherUser = getOtherUser(convo);
              const isActive = activeConversation?.id === convo.id;
              
              return (
                <div
                  key={convo.id}
                  onClick={() => setActiveConversation(convo)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                    isActive
                      ? "bg-brand-coral/5 border-brand-coral/20"
                      : "bg-transparent border-transparent hover:bg-fog/50"
                  }`}
                >
                  <img
                    src={getAvatarUrl(otherUser)}
                    alt={otherUser.name}
                    className="h-11 w-11 rounded-full object-cover border border-mist shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-xs text-carbon truncate">{otherUser.name}</h4>
                      <span className="text-[9px] text-slate font-medium">
                        {convo.updatedAt ? convo.updatedAt.split("T")[0] : ""}
                      </span>
                    </div>
                    <p className={`text-[10px] truncate mt-0.5 ${isActive ? "text-brand-coral font-semibold" : "text-slate"}`}>
                      {convo.lastMessage || "Nhấn để bắt đầu thương lượng..."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Right Pane: Messaging Viewport */}
      {activeConversation ? (
        <div className="flex-1 bg-cloud border border-mist rounded-[24px] overflow-hidden flex flex-col text-left shadow-xs">
          
          {/* Active Chat Header */}
          {(() => {
            const otherUser = getOtherUser(activeConversation);
            return (
              <div className="px-5 py-4 border-b border-mist flex items-center justify-between bg-cloud">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("home")}
                    className="md:hidden p-1.5 hover:bg-fog rounded-full text-carbon cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <img
                    src={getAvatarUrl(otherUser)}
                    alt={otherUser.name}
                    className="h-9 w-9 rounded-full object-cover border border-mist"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-carbon">{otherUser.name}</h4>
                    <p className="text-[9px] text-[#6B7280]">Liên hệ thảo luận sản phẩm</p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteConversation}
                  className="p-2 text-slate hover:text-red-500 hover:bg-rose-50 rounded-full transition cursor-pointer animate-in fade-in"
                  title="Xóa cuộc trò chuyện này"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            );
          })()}

          {/* Messages & Widget viewport container */}
          <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
            
            {/* 3. EXCHANGE WIDGET BANNER */}
            {exchangeDetails && (
              <div className="p-4 bg-brand-coral/5 border-b border-brand-coral/10 font-sans space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-xs text-brand-coral font-black">
                    <ShieldCheck className="h-4 w-4" />
                    <span>YÊU CẦU TRAO ĐỔI VẬT PHẨM</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    exchangeDetails.status === "Approved" || exchangeDetails.status === "Completed"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : exchangeDetails.status === "Pending"
                        ? "bg-amber-50 text-amber-600 border-amber-100"
                        : "bg-rose-50 text-rose-600 border-rose-100"
                  }`}>
                    {exchangeDetails.status === "Pending" && "Đang chờ duyệt"}
                    {exchangeDetails.status === "Approved" && "Đã chấp nhận"}
                    {exchangeDetails.status === "Rejected" && "Đã từ chối"}
                    {exchangeDetails.status === "Completed" && "Hoàn tất giao dịch"}
                    {exchangeDetails.status === "Canceled" && "Đã hủy"}
                  </span>
                </div>

                {loadingExchange ? (
                  <div className="bg-white border border-brand-coral/10 rounded-2xl p-4 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-brand-coral animate-spin" />
                  </div>
                ) : (
                  <div className="bg-white border border-brand-coral/10 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm font-sans">
                    {/* Left Listing: Proposer Item */}
                    <div className="flex-1 flex items-center gap-3 min-w-0">
                      <img
                        src={proposerListing?.images?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"}
                        alt="proposer-item"
                        className="h-12 w-12 rounded-xl object-cover border border-mist shrink-0"
                      />
                      <div className="min-w-0 text-left">
                        <p className="text-[9px] text-slate font-bold uppercase tracking-wider">Đề xuất đổi</p>
                        <h4 className="font-bold text-xs text-carbon truncate mt-0.5" title={proposerListing?.title}>
                          {proposerListing?.title || "Đang tải..."}
                        </h4>
                        <p className="text-[9px] text-brand-coral font-bold mt-0.5">
                          {proposerListing?.price ? `${proposerListing.price.toLocaleString("vi-VN")} đ` : "Đồ trao đổi"}
                        </p>
                      </div>
                    </div>

                    {/* Swap Arrow Icon */}
                    <div className="h-7 w-7 rounded-full bg-brand-coral/10 text-brand-coral flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      ⇄
                    </div>

                    {/* Right Listing: Receiver Item */}
                    <div className="flex-1 flex items-center gap-3 min-w-0 flex-row-reverse text-right">
                      <img
                        src={receiverListing?.images?.[0] || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80"}
                        alt="receiver-item"
                        className="h-12 w-12 rounded-xl object-cover border border-mist shrink-0"
                      />
                      <div className="min-w-0 text-right">
                        <p className="text-[9px] text-slate font-bold uppercase tracking-wider">Để nhận lấy</p>
                        <h4 className="font-bold text-xs text-carbon truncate mt-0.5" title={receiverListing?.title}>
                          {receiverListing?.title || "Đang tải..."}
                        </h4>
                        <p className="text-[9px] text-brand-coral font-bold mt-0.5">
                          {receiverListing?.price ? `${receiverListing.price.toLocaleString("vi-VN")} đ` : "Đồ trao đổi"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Actions inside conversation widget */}
                <div className="flex gap-2">
                  {/* If recipient (current user is recipient) */}
                  {exchangeDetails.receiverId?.toLowerCase() === currentUser.id.toLowerCase() && exchangeDetails.status === "Pending" && (
                    <>
                      <button
                        onClick={handleAcceptExchange}
                        disabled={actionLoading}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" />
                        Chấp nhận đổi đồ
                      </button>
                      <button
                        onClick={handleRejectExchange}
                        disabled={actionLoading}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-xl text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <X className="h-3 w-3" />
                        Từ chối
                      </button>
                    </>
                  )}

                  {/* Complete Action once accepted */}
                  {exchangeDetails.status === "Approved" && (
                    <button
                      onClick={handleCompleteExchange}
                      disabled={actionLoading}
                      className="w-full bg-brand-coral hover:bg-brand-deep text-white font-bold py-2 rounded-xl text-[11px] transition shadow-xs flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="h-3 w-3" />
                      Xác nhận đã trao đổi thành công ngoài đời thực
                    </button>
                  )}

                  {/* Proposer cancel request */}
                  {exchangeDetails.proposerId?.toLowerCase() === currentUser.id.toLowerCase() && exchangeDetails.status === "Pending" && (
                    <button
                      onClick={handleCancelExchange}
                      disabled={actionLoading}
                      className="w-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2 rounded-xl text-[11px] transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                      Hủy đề xuất trao đổi này
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Messages body rendering */}
            <div className="flex-1 p-5 space-y-4 bg-fog/15 overflow-y-auto no-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate text-xs space-y-2 py-10">
                  <p className="font-bold text-carbon">Bắt đầu thương lượng</p>
                  <p className="text-[10px] text-slate/70">Hãy nhắn tin hỏi thăm tình trạng đồ và trao đổi địa điểm trực tiếp!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId?.toLowerCase() === currentUser.id.toLowerCase();
                  const sender = getUserDetails(msg.senderId);
                  
                  return (
                    <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                      {!isMe && (
                        <img
                          src={getAvatarUrl(sender)}
                          alt={sender.name}
                          className="h-8 w-8 rounded-full object-cover border border-mist shrink-0 mt-0.5"
                        />
                      )}
                      <div className="space-y-1">
                        <div
                          className={`px-4 py-2.5 rounded-[20px] text-xs leading-relaxed font-sans shadow-xs ${
                            isMe
                              ? "bg-brand-coral text-cloud rounded-tr-none font-medium"
                              : "bg-white text-carbon rounded-tl-none border border-mist"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <p className={`text-[8px] text-slate font-medium ${isMe ? "text-right" : "text-left"}`}>
                          {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

          </div>

          {/* Message input bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-mist flex gap-2 bg-cloud">
            <input
              type="text"
              placeholder="Nhập tin nhắn để thảo luận trao đổi đồ..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 border border-mist rounded-xl px-4 py-2 text-xs text-carbon focus:outline-none focus:border-brand-coral bg-fog/30"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={isSending}
              className="h-9 w-9 bg-brand-coral hover:bg-brand-deep text-cloud rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 fill-none" />
              )}
            </button>
          </form>

        </div>
      ) : (
        <div className="flex-1 bg-cloud border border-mist rounded-[24px] flex flex-col items-center justify-center text-center p-8 text-slate space-y-3">
          <div className="h-14 w-14 rounded-full bg-brand-coral/5 border border-brand-coral/10 text-brand-coral flex items-center justify-center">
            <Send className="h-6 w-6 rotate-45 translate-x-[-1px] translate-y-[1px]" />
          </div>
          <h4 className="font-bold text-carbon text-sm">Chưa chọn cuộc hội thoại</h4>
          <p className="text-xs text-slate max-w-xs mx-auto">Chọn một cuộc trò chuyện bên trái để bắt đầu nhắn tin thương lượng và trao đổi đồ.</p>
        </div>
      )}

    </main>
  );
}

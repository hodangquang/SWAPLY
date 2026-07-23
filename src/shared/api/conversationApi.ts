import { Exchange } from "@/types";

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

export interface ConversationDto {
  otherUserId: string;
  relatedListingId?: string;
  relatedExchangeId?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  relatedListingId?: string;
  relatedExchangeId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
}

export interface SendMessageDto {
  content: string;
}

export async function fetchConversations(): Promise<Conversation[]> {
  const token = getAuthToken();
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${getBaseUrl()}/Conversations`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json().catch(() => null);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error fetching conversations:", e);
    return [];
  }
}

export async function createConversation(dto: ConversationDto): Promise<Conversation> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để tạo cuộc trò chuyện.");
  }

  const response = await fetch(`${getBaseUrl()}/Conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.message || errData.error || "Tạo cuộc trò chuyện thất bại.";
    
    // If already exists, retrieve and return the existing conversation
    if (errMsg.toLowerCase().includes("already exists") || errMsg.toLowerCase().includes("trùng") || errMsg.toLowerCase().includes("tồn tại")) {
      try {
        const existingList = await fetchConversations();
        
        let currentUserId = "";
        try {
          const userData = localStorage.getItem("swaply_current_user");
          if (userData) {
            currentUserId = JSON.parse(userData).id || "";
          }
        } catch {}

        const targetId = dto.otherUserId.toLowerCase();
        const match = existingList.find((c: any) => {
          if (c.otherUserId && c.otherUserId.toLowerCase() === targetId) {
            return true;
          }
          if (Array.isArray(c.participantIds)) {
            return c.participantIds.some((id: string) => id && id.toLowerCase() === targetId);
          }
          if (Array.isArray(c.participants)) {
            return c.participants.some((p: any) => {
              const pid = typeof p === "string" ? p : p.id || p.userId;
              return pid && pid.toLowerCase() === targetId;
            });
          }
          const u1 = (c.user1Id || c.proposerId || "").toLowerCase();
          const u2 = (c.user2Id || c.receiverId || "").toLowerCase();
          return u1 === targetId || u2 === targetId;
        });

        if (match) {
          return match;
        }
      } catch (e) {
        console.warn("Failed to find existing conversation during conflict fallback:", e);
      }
    }
    
    throw new Error(errMsg);
  }

  return await response.json();
}

export async function fetchConversationById(id: string): Promise<Conversation | null> {
  const token = getAuthToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${getBaseUrl()}/Conversations/${encodeURIComponent(id)}`, {
      headers: buildAuthHeaders(),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json().catch(() => null);
  } catch (e) {
    console.error(`Error fetching conversation with id ${id}:`, e);
    return null;
  }
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const token = getAuthToken();
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(
      `${getBaseUrl()}/Conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        headers: buildAuthHeaders(),
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json().catch(() => null);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Error fetching messages:", e);
    return [];
  }
}

export async function sendMessage(conversationId: string, dto: SendMessageDto): Promise<Message> {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Vui lòng đăng nhập để gửi tin nhắn.");
  }

  const response = await fetch(
    `${getBaseUrl()}/Conversations/${encodeURIComponent(conversationId)}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...buildAuthHeaders(),
      },
      body: JSON.stringify(dto),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData.error || "Gửi tin nhắn thất bại.";
    throw new Error(errMsg);
  }

  return await response.json();
}

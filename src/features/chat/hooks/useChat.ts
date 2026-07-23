import { useState, useEffect } from "react";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  propertyId?: string;
}

const MOCK_REPLIES = [
  "Chào bạn, sản phẩm của bạn nhìn rất đẹp và đúng nhu cầu của mình!",
  "Món đồ của mình còn đầy đủ hộp và bảo hành nhé, bạn có muốn đổi ngang không?",
  "Mình rảnh vào các buổi chiều, chúng ta có thể hẹn gặp ở Cầu Giấy để test đồ trực tiếp nha.",
  "Bạn có cần mình bù thêm tiền không? Giá trị máy của bạn có vẻ cao hơn một chút.",
  "Chốt vậy nhé bạn! Lát mình sẽ tạo đề xuất trao đổi chính thức trên app để hệ thống ghi nhận."
];

export function useChat(activePartnerId: string = "partner-1") {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("swaply_messages");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("swaply_messages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = (text: string, sender: { id: string; name: string; avatar: string }) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      text,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, newMsg]);

    // Schedule auto reply
    setTimeout(() => {
      const replyText = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];
      const replyMsg: ChatMessage = {
        id: `msg-reply-${Date.now()}`,
        senderId: activePartnerId,
        senderName: "Lê Hoàng Nam",
        senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
        text: replyText,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, replyMsg]);
    }, 1500);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    sendMessage,
    clearChat
  };
}

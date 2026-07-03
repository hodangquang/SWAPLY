import React, { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MoreVertical, Trash2 } from "lucide-react";
import { useChat } from "@features/chat/hooks/useChat";
import { useRouter } from "@shared/context/RouterContext";

interface ChatPageProps {
  currentUser: { id: string; name: string; avatar: string };
}

export default function ChatPage({ currentUser }: ChatPageProps) {
  const { navigate } = useRouter();
  const { messages, sendMessage, clearChat } = useChat();
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText.trim(), currentUser);
    setInputText("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex-1 w-full max-w-[1000px] mx-auto px-6 py-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-14rem)] min-h-[500px]">
      
      {/* Left Pane: Chat list */}
      <div className="w-full md:w-80 bg-cloud border border-mist rounded-[20px] p-4 flex flex-col shrink-0 text-left">
        <h3 className="font-bold text-carbon text-sm uppercase tracking-wider mb-4">Hộp thư đến</h3>
        <div className="space-y-2 overflow-y-auto no-scrollbar flex-1">
          {/* Active Partner Thread */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-coral/5 border border-brand-coral/20 cursor-pointer">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"
              alt="Lê Hoàng Nam"
              className="h-11 w-11 rounded-full object-cover border border-mist"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="font-semibold text-xs text-carbon truncate">Lê Hoàng Nam</h4>
                <span className="text-[9px] text-slate font-medium">Vừa xong</span>
              </div>
              <p className="text-[11px] text-slate truncate font-medium mt-0.5">
                {messages.length > 0 ? messages[messages.length - 1].text : "Bắt đầu cuộc trò chuyện..."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Message Viewport */}
      <div className="flex-1 bg-cloud border border-mist rounded-[20px] overflow-hidden flex flex-col text-left">
        {/* Chat partner header */}
        <div className="px-5 py-4 border-b border-mist flex items-center justify-between bg-cloud">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("home")}
              className="md:hidden p-1.5 hover:bg-fog rounded-full text-carbon"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"
              alt="Lê Hoàng Nam"
              className="h-9 w-9 rounded-full object-cover"
            />
            <div>
              <h4 className="font-bold text-xs text-carbon">Lê Hoàng Nam</h4>
              <p className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span> Trực tuyến
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (window.confirm("Bạn có muốn xóa cuộc trò chuyện này không?")) {
                clearChat();
              }
            }}
            className="p-2 text-slate hover:text-red-500 hover:bg-red-50 rounded-full transition cursor-pointer"
            title="Xóa tin nhắn"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Messages list area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-fog/20">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate text-xs space-y-2">
              <p>Chưa có tin nhắn nào.</p>
              <p className="text-[11px] text-slate/70">Hãy gửi tin nhắn để thương lượng trao đổi sản phẩm ngay!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                  {!isMe && (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="h-7 w-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                  )}
                  <div className="space-y-1">
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed font-sans ${
                        isMe
                          ? "bg-brand-coral text-cloud rounded-tr-none font-medium shadow-xs"
                          : "bg-cloud text-carbon rounded-tl-none border border-mist shadow-xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p className={`text-[9px] text-slate font-medium ${isMe ? "text-right" : "text-left"}`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Message Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-mist flex gap-2 bg-cloud">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 border border-mist rounded-xl px-4 py-2 text-xs text-carbon focus:outline-none focus:border-brand-coral bg-fog/30"
          />
          <button
            type="submit"
            className="h-9 w-9 bg-brand-coral hover:bg-brand-deep text-cloud rounded-xl flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <Send className="h-4 w-4 fill-none" />
          </button>
        </form>
      </div>
    </main>
  );
}

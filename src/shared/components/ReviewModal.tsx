import React, { useState } from "react";
import { Star, X, MessageSquare, HeartHandshake } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  exchangeId: string;
  revieweeId: string;
  revieweeName: string;
  onClose: () => void;
  onSubmit: (dto: { exchangeId: string; revieweeId: string; rating: number; comment: string }) => Promise<void>;
}

export default function ReviewModal({
  isOpen,
  exchangeId,
  revieweeId,
  revieweeName,
  onClose,
  onSubmit
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá!");
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        exchangeId,
        revieweeId,
        rating,
        comment: comment.trim() || "Giao dịch trao đổi thành công và tốt đẹp!"
      });
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-carbon/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      
      <div 
        className="bg-cloud border border-mist max-w-[420px] w-full rounded-[24px] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-left font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex justify-between items-start">
          <div className="h-11 w-11 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
            <HeartHandshake className="h-5.5 w-5.5" />
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-fog rounded-full text-slate hover:text-carbon transition cursor-pointer"
            title="Đóng"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h3 className="font-bold text-carbon text-base leading-tight">
            Đánh giá người dùng
          </h3>
          <p className="text-slate text-xs leading-relaxed">
            Hãy gửi đánh giá trải nghiệm trao đổi của bạn với đối tác <span className="font-semibold text-carbon">{revieweeName}</span>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Star selector */}
          <div className="flex flex-col items-center py-2 bg-fog/20 rounded-2xl border border-mist/50 gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate">Chọn điểm đánh giá:</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isStarred = hoverRating !== null ? star <= hoverRating : star <= rating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition duration-150 cursor-pointer hover:scale-110 active:scale-95"
                  >
                    <Star 
                      className={`h-7 w-7 transition-colors duration-150 ${
                        isStarred 
                          ? "fill-amber-400 text-amber-400" 
                          : "text-slate/30 fill-none"
                      }`} 
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-carbon mt-1">
              {rating === 1 ? "Rất tệ 😟" :
               rating === 2 ? "Không hài lòng 🙁" :
               rating === 3 ? "Bình thường 😐" :
               rating === 4 ? "Tốt 🙂" : "Tuyệt vời! 😍"}
            </span>
          </div>

          {/* Comment text area */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate uppercase tracking-wider block">Bình luận:</label>
            <textarea
              rows={4}
              placeholder="Chia sẻ cảm nhận của bạn về buổi trao đổi đồ này..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-mist rounded-xl px-4 py-3 text-xs text-carbon outline-none focus:border-brand-coral transition resize-none leading-relaxed"
            />
          </div>

          {/* Submit Footer */}
          <div className="flex gap-3 pt-2 text-xs font-bold">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-mist hover:bg-fog text-carbon py-2.5 rounded-xl transition cursor-pointer active:scale-97"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-brand-coral hover:bg-brand-deep text-cloud py-2.5 rounded-xl transition cursor-pointer active:scale-97 shadow-md flex items-center justify-center gap-1"
            >
              {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}

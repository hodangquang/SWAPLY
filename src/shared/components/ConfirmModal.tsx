import React from "react";
import { AlertTriangle, X, ShieldAlert, Info } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  type = "warning"
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-carbon/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      
      {/* Modal Dialog Body */}
      <div 
        className="bg-cloud border border-mist max-w-[380px] w-full rounded-[24px] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-left font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Close button + icon */}
        <div className="flex justify-between items-start">
          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center ${
            type === "danger" 
              ? "bg-rose-50 text-rose-500 border border-rose-100" 
              : type === "warning"
                ? "bg-amber-50 text-amber-600 border border-amber-100"
                : "bg-blue-50 text-blue-500 border border-blue-100"
          }`}>
            {type === "danger" ? (
              <ShieldAlert className="h-5.5 w-5.5" />
            ) : type === "warning" ? (
              <AlertTriangle className="h-5.5 w-5.5" />
            ) : (
              <Info className="h-5.5 w-5.5" />
            )}
          </div>
          <button 
            onClick={onCancel}
            className="p-1.5 hover:bg-fog rounded-full text-slate hover:text-carbon transition cursor-pointer"
            title="Đóng"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Text Description */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-carbon text-base leading-tight">
            {title}
          </h3>
          <p className="text-slate text-xs leading-relaxed">
            {message}
          </p>
        </div>

        {/* Buttons Action Footer */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 border border-mist hover:bg-fog text-carbon font-bold py-2.5 rounded-xl transition cursor-pointer text-center text-xs active:scale-97"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className={`flex-1 text-cloud font-bold py-2.5 rounded-xl transition cursor-pointer text-center text-xs active:scale-97 shadow-md ${
              type === "danger"
                ? "bg-rose-500 hover:bg-rose-600 shadow-rose-100"
                : type === "warning"
                  ? "bg-brand-coral hover:bg-brand-deep shadow-rose-100"
                  : "bg-blue-500 hover:bg-blue-600 shadow-blue-100"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>

    </div>
  );
}

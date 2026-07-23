import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = window.location.origin;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-fog flex items-center justify-center p-6 font-sans select-none selection:bg-brand-coral/20">
          <div className="max-w-md w-full bg-cloud border border-mist shadow-2xl rounded-3xl p-8 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Warning Icon Container */}
            <div className="mx-auto h-16 w-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center shadow-sm">
              <AlertTriangle className="h-8 w-8" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-carbon">Đã xảy ra sự cố!</h1>
              <p className="text-slate text-xs leading-relaxed">
                Ứng dụng SWAPLY gặp lỗi không mong muốn trong lúc hiển thị giao diện. Đừng lo lắng, dữ liệu của bạn vẫn an toàn.
              </p>
            </div>

            {/* Error detail placeholder */}
            {this.state.error && (
              <div className="p-3 bg-fog border border-mist rounded-xl text-left font-mono text-[10px] text-slate overflow-auto max-h-32 leading-normal">
                <span className="font-bold text-rose-600">Error:</span> {this.state.error.message}
                {this.state.error.stack && (
                  <pre className="mt-1 whitespace-pre-wrap opacity-80">{this.state.error.stack.split("\n").slice(0, 3).join("\n")}</pre>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-brand-coral hover:bg-brand-deep text-cloud py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Tải lại trang</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 border border-mist hover:bg-fog text-carbon py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Về trang chủ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

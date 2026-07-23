import React, { useState, useEffect } from "react";
import { Mail, Lock, User, Phone, Eye, EyeOff, X, Loader2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "register" | "forgot-password";
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  onRegister: (name: string, username: string, email: string, password: string, phone: string, otpCode: string) => Promise<{ success: boolean; error?: string }>;
  onForgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  onResetPassword: (email: string, otpCode: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  onRequestOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

// Yup Validation Schemas
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required("Tên đăng nhập không được bỏ trống"),
  password: Yup.string()
    .min(6, "Mật khẩu phải từ 6 ký tự trở lên")
    .required("Mật khẩu không được bỏ trống")
});

const registerSchema = Yup.object().shape({
  name: Yup.string()
    .required("Họ tên không được bỏ trống"),
  username: Yup.string()
    .min(3, "Tên đăng nhập phải từ 3 ký tự trở lên")
    .required("Tên đăng nhập không được bỏ trống"),
  email: Yup.string()
    .email("Định dạng email không hợp lệ")
    .required("Email không được bỏ trống"),
  phone: Yup.string()
    .matches(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ (từ 9 đến 11 chữ số)")
    .required("Số điện thoại không được bỏ trống"),
  password: Yup.string()
    .min(6, "Mật khẩu phải từ 6 ký tự trở lên")
    .required("Mật khẩu không được bỏ trống"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Mật khẩu xác nhận không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
  otpCode: Yup.string()
    .required("Vui lòng nhập mã OTP")
});

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Định dạng email không hợp lệ")
    .required("Email không được bỏ trống")
});

const resetPasswordSchema = Yup.object().shape({
  otpCode: Yup.string()
    .required("Vui lòng nhập mã OTP"),
  password: Yup.string()
    .min(6, "Mật khẩu phải từ 6 ký tự trở lên")
    .required("Mật khẩu không được bỏ trống"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Mật khẩu xác nhận không khớp")
    .required("Vui lòng xác nhận mật khẩu")
});

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "login",
  onLogin,
  onRegister,
  onForgotPassword,
  onResetPassword,
  onRequestOtp,
  isLoading
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot-password">(initialTab);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // States for Password Reset flow
  const [isResetOtpSent, setIsResetOtpSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const handleSendOtp = async () => {
    const emailValue = registerFormik.values.email;
    if (!emailValue) {
      toast.error("Vui lòng điền địa chỉ email trước để nhận mã OTP.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      toast.error("Định dạng email không hợp lệ.");
      return;
    }

    setIsSendingOtp(true);

    const res = await onRequestOtp(emailValue);
    setIsSendingOtp(false);
    if (res.success) {
      setOtpSent(true);
      toast.success("Mã OTP đăng ký đã được gửi vào Email của bạn.");
    } else {
      toast.error(res.error || "Gửi OTP thất bại. Vui lòng thử lại.");
    }
  };

  // Formik for Login
  const loginFormik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      const res = await onLogin(values.email, values.password);
      if (res.success) {
        toast.success("Đăng nhập thành công! Đang tải lại trang...");
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        toast.error(res.error || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    }
  });

  // Formik for Register
  const registerFormik = useFormik({
    initialValues: { name: "", username: "", email: "", phone: "", password: "", confirmPassword: "", otpCode: "" },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      const res = await onRegister(values.name, values.username, values.email, values.password, values.phone, values.otpCode);
      if (res.success) {
        toast.success("Đăng ký tài khoản thành công! Đang đăng nhập...");
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1500);
      } else {
        toast.error(res.error || "Đăng ký thất bại. Vui lòng thử lại.");
      }
    }
  });

  // Formik for Forgot Password (Step 1)
  const forgotPasswordFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      const res = await onForgotPassword(values.email);
      if (res.success) {
        toast.success("Mã OTP khôi phục mật khẩu đã được gửi đến Email của bạn.");
        setResetEmail(values.email);
        setIsResetOtpSent(true);
      } else {
        toast.error(res.error || "Không thể gửi mã xác nhận. Vui lòng thử lại.");
      }
    }
  });

  // Formik for Reset Password (Step 2)
  const resetPasswordFormik = useFormik({
    initialValues: { otpCode: "", password: "", confirmPassword: "" },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      const res = await onResetPassword(resetEmail, values.otpCode, values.password);
      if (res.success) {
        toast.success("Mật khẩu đã được đặt lại thành công!");
        setIsResetOtpSent(false);
        setResetEmail("");
        resetPasswordFormik.resetForm();
        forgotPasswordFormik.resetForm();
        setActiveTab("login");
      } else {
        toast.error(res.error || "Đặt lại mật khẩu thất bại. Vui lòng kiểm tra mã OTP.");
      }
    }
  });

  // Sync activeTab with initialTab when opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      resetForms();
    }
  }, [isOpen, initialTab]);

  const resetForms = () => {
    loginFormik.resetForm();
    registerFormik.resetForm();
    forgotPasswordFormik.resetForm();
    resetPasswordFormik.resetForm();
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowPassword(false);
    setIsSendingOtp(false);
    setOtpSent(false);
    setIsResetOtpSent(false);
    setResetEmail("");
  };

  const handleTabChange = (tab: "login" | "register" | "forgot-password") => {
    setActiveTab(tab);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-[390px] max-h-[96vh] bg-cloud rounded-2xl border border-mist shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 text-slate hover:text-carbon p-1 rounded-full hover:bg-fog transition cursor-pointer"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        {/* Header Branding */}
        <div className="pt-5 pb-2 px-5 text-center flex flex-col items-center gap-1">
          <div className="h-8 w-8 bg-brand-coral rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-base">S</span>
          </div>
          <h2 className="font-sans font-black tracking-wider text-lg text-carbon">SWAPLY</h2>
          <p className="text-slate text-[10px]">Nền tảng trao đổi đồ dùng thông minh</p>
        </div>

        {/* Animated Tabs switcher */}
        {activeTab !== "forgot-password" && (
          <div className="flex border-b border-mist px-5">
            <button
              onClick={() => handleTabChange("login")}
              className={`flex-1 pb-2 text-xs font-bold tracking-wide border-b-2 transition relative cursor-pointer ${activeTab === "login"
                  ? "text-brand-coral border-brand-coral"
                  : "text-slate border-transparent hover:text-carbon"
                }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => handleTabChange("register")}
              className={`flex-1 pb-2 text-xs font-bold tracking-wide border-b-2 transition relative cursor-pointer ${activeTab === "register"
                  ? "text-brand-coral border-brand-coral"
                  : "text-slate border-transparent hover:text-carbon"
                }`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* Content Form: LOGIN */}
        {activeTab === "login" && (
          <form onSubmit={loginFormik.handleSubmit} className="p-4 md:p-5 space-y-3 flex-1 overflow-y-auto no-scrollbar">
            <div className="space-y-2.5">
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Tên đăng nhập</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    name="email"
                    placeholder="Nhập tên đăng nhập"
                    value={loginFormik.values.email}
                    onChange={loginFormik.handleChange}
                    onBlur={loginFormik.handleBlur}
                    className="w-full pl-8 pr-3 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                  />
                </div>
                {loginFormik.touched.email && loginFormik.errors.email && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{loginFormik.errors.email}</div>
                )}
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Mật khẩu</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={loginFormik.values.password}
                    onChange={loginFormik.handleChange}
                    onBlur={loginFormik.handleBlur}
                    className="w-full pl-8 pr-9 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate hover:text-carbon cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {loginFormik.touched.password && loginFormik.errors.password && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{loginFormik.errors.password}</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <label className="flex items-center gap-1.5 text-slate hover:text-carbon cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-mist text-brand-coral focus:ring-brand-coral cursor-pointer"
                  defaultChecked
                />
                Ghi nhớ tôi
              </label>
              <button
                type="button"
                onClick={() => handleTabChange("forgot-password")}
                className="font-semibold text-brand-coral hover:underline cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-2 bg-brand-coral hover:bg-brand-deep disabled:bg-brand-coral/75 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Vui lòng đợi...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>

            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-mist"></div>
              </div>
              <span className="relative px-2 bg-cloud text-[9px] uppercase font-bold text-slate tracking-widest">
                Hoặc tiếp tục với
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => alert("Chức năng đăng nhập Google đang được phát triển.")}
                className="flex items-center justify-center gap-1.5 border border-mist hover:bg-fog py-1.5 px-3 rounded-lg text-[11px] font-semibold text-carbon transition cursor-pointer select-none"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.47 15.01.5 12 .5 7.42.5 3.51 3.12 1.62 6.94l3.86 3c.9-2.7 3.42-4.9 6.52-4.9z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.8-.07-1.56-.2-2.3H12v4.51h6.43c-.28 1.45-1.1 2.68-2.33 3.51l3.63 2.81c2.12-1.95 3.36-4.83 3.36-8.52z" />
                  <path fill="#FBBC05" d="M5.48 14.94c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18v-3L1.62 6.94C.59 9.02 0 11.41 0 13.9c0 2.49.59 4.88 1.62 6.96l3.86-3.02z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.63-2.81c-1.1.74-2.51 1.18-4.33 1.18-3.1 0-5.73-2.2-6.67-5.06l-3.86 3.01C3.51 20.38 7.42 23 12 23z" />
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => alert("Chức năng đăng nhập Facebook đang được phát triển.")}
                className="flex items-center justify-center gap-1.5 border border-mist hover:bg-fog py-1.5 px-3 rounded-lg text-[11px] font-semibold text-carbon transition cursor-pointer select-none"
              >
                <svg className="h-3.5 w-3.5 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>

            <p className="text-center text-[11px] text-slate mt-2">
              Chưa có tài khoản?{" "}
              <button
                type="button"
                onClick={() => handleTabChange("register")}
                className="font-semibold text-brand-coral hover:underline cursor-pointer"
              >
                Đăng ký ngay
              </button>
            </p>
          </form>
        )}

        {/* Content Form: REGISTER */}
        {activeTab === "register" && (
          <form onSubmit={registerFormik.handleSubmit} className="p-4 md:p-5 space-y-3 flex-1 overflow-y-auto no-scrollbar">
            <div className="space-y-2.5">
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Họ và tên</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Nguyễn Văn A"
                    value={registerFormik.values.name}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    className="w-full pl-8 pr-3 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                  />
                </div>
                {registerFormik.touched.name && registerFormik.errors.name && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{registerFormik.errors.name}</div>
                )}
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Tên đăng nhập</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                    <User className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    name="username"
                    placeholder="Nhập tên đăng nhập"
                    value={registerFormik.values.username}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    className="w-full pl-8 pr-3 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                  />
                </div>
                {registerFormik.touched.username && registerFormik.errors.username && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{registerFormik.errors.username}</div>
                )}
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Địa chỉ Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@domain.com"
                    value={registerFormik.values.email}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    className="w-full pl-8 pr-3 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                  />
                </div>
                {registerFormik.touched.email && registerFormik.errors.email && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{registerFormik.errors.email}</div>
                )}
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Số điện thoại</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="09XXXXXXXX"
                    value={registerFormik.values.phone}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    className="w-full pl-8 pr-3 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                  />
                </div>
                {registerFormik.touched.phone && registerFormik.errors.phone && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{registerFormik.errors.phone}</div>
                )}
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Mật khẩu</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={registerFormik.values.password}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    className="w-full pl-8 pr-9 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate hover:text-carbon cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {registerFormik.touched.password && registerFormik.errors.password && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{registerFormik.errors.password}</div>
                )}
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Xác nhận mật khẩu</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={registerFormik.values.confirmPassword}
                    onChange={registerFormik.handleChange}
                    onBlur={registerFormik.handleBlur}
                    className="w-full pl-8 pr-3 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                  />
                </div>
                {registerFormik.touched.confirmPassword && registerFormik.errors.confirmPassword && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{registerFormik.errors.confirmPassword}</div>
                )}
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Mã xác thực OTP</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                      <Lock className="h-3.5 w-3.5" />
                    </span>
                    <input
                      type="text"
                      name="otpCode"
                      placeholder="Mã xác thực gửi về Email"
                      value={registerFormik.values.otpCode}
                      onChange={registerFormik.handleChange}
                      onBlur={registerFormik.handleBlur}
                      className="w-full pl-8 pr-3 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isSendingOtp}
                    onClick={handleSendOtp}
                    className="px-3 bg-fog hover:bg-pebble border border-mist text-slate hover:text-carbon text-[11px] font-bold rounded-lg transition active:scale-95 cursor-pointer disabled:opacity-50 select-none whitespace-nowrap"
                  >
                    {isSendingOtp ? "Đang gửi..." : otpSent ? "Gửi lại OTP" : "Nhận mã OTP"}
                  </button>
                </div>
                {registerFormik.touched.otpCode && registerFormik.errors.otpCode && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{registerFormik.errors.otpCode}</div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2 bg-brand-coral hover:bg-brand-deep disabled:bg-brand-coral/75 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Vui lòng đợi...
                </>
              ) : (
                "Đăng ký ngay"
              )}
            </button>

            <p className="text-center text-[11px] text-slate mt-2">
              Đã có tài khoản?{" "}
              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className="font-semibold text-brand-coral hover:underline cursor-pointer"
              >
                Đăng nhập
              </button>
            </p>
          </form>
        )}

        {/* Content Form: FORGOT PASSWORD & RESET PASSWORD */}
        {activeTab === "forgot-password" && (
          !isResetOtpSent ? (
            <form onSubmit={forgotPasswordFormik.handleSubmit} className="p-4 md:p-5 space-y-4 flex-1 overflow-y-auto no-scrollbar">
              <div className="text-center space-y-1">
                <h3 className="font-sans font-extrabold text-sm text-carbon uppercase tracking-wider">Khôi phục mật khẩu</h3>
                <p className="text-slate text-[11px] leading-relaxed">
                  Vui lòng điền email của bạn để chúng tôi gửi mã OTP khôi phục mật khẩu.
                </p>
              </div>

              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Địa chỉ Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@domain.com"
                    value={forgotPasswordFormik.values.email}
                    onChange={forgotPasswordFormik.handleChange}
                    onBlur={forgotPasswordFormik.handleBlur}
                    className="w-full pl-8 pr-3 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                  />
                </div>
                {forgotPasswordFormik.touched.email && forgotPasswordFormik.errors.email && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{forgotPasswordFormik.errors.email}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-brand-coral hover:bg-brand-deep disabled:bg-brand-coral/75 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  "Gửi mã OTP"
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("login")}
                className="w-full py-1.5 text-center text-xs font-semibold text-slate hover:text-carbon transition cursor-pointer hover:underline"
              >
                Quay lại Đăng nhập
              </button>
            </form>
          ) : (
            <form onSubmit={resetPasswordFormik.handleSubmit} className="p-4 md:p-5 space-y-4 flex-1 overflow-y-auto no-scrollbar">
              <div className="text-center space-y-1">
                <h3 className="font-sans font-extrabold text-sm text-carbon uppercase tracking-wider">Đặt lại mật khẩu</h3>
                <p className="text-slate text-[11px] leading-relaxed">
                  Mã OTP đã được gửi đến email <span className="font-semibold text-carbon">{resetEmail}</span>.
                </p>
              </div>

              {/* OTP Code */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Mã xác thực OTP</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                    <Mail className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    name="otpCode"
                    placeholder="Nhập mã OTP gồm 6 chữ số"
                    value={resetPasswordFormik.values.otpCode}
                    onChange={resetPasswordFormik.handleChange}
                    onBlur={resetPasswordFormik.handleBlur}
                    className="w-full pl-8 pr-3 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                  />
                </div>
                {resetPasswordFormik.touched.otpCode && resetPasswordFormik.errors.otpCode && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{resetPasswordFormik.errors.otpCode}</div>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Mật khẩu mới</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Nhập mật khẩu mới"
                    value={resetPasswordFormik.values.password}
                    onChange={resetPasswordFormik.handleChange}
                    onBlur={resetPasswordFormik.handleBlur}
                    className="w-full pl-8 pr-10 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate hover:text-carbon cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {resetPasswordFormik.touched.password && resetPasswordFormik.errors.password && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{resetPasswordFormik.errors.password}</div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-0.5">
                <label className="text-[10px] font-bold text-carbon uppercase tracking-wider block">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu mới"
                    value={resetPasswordFormik.values.confirmPassword}
                    onChange={resetPasswordFormik.handleChange}
                    onBlur={resetPasswordFormik.handleBlur}
                    className="w-full pl-8 pr-10 py-1.5 bg-cloud border border-mist rounded-lg text-xs text-carbon placeholder-slate/50 focus:outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral transition"
                  />
                </div>
                {resetPasswordFormik.touched.confirmPassword && resetPasswordFormik.errors.confirmPassword && (
                  <div className="text-brand-coral text-[10px] font-semibold mt-0.5 leading-none">{resetPasswordFormik.errors.confirmPassword}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-brand-coral hover:bg-brand-deep disabled:bg-brand-coral/75 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận đặt lại mật khẩu"
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsResetOtpSent(false)}
                className="w-full py-1.5 text-center text-xs font-semibold text-slate hover:text-carbon transition cursor-pointer hover:underline"
              >
                Quay lại bước trước
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
}

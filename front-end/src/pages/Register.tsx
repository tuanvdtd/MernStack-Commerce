import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import svgPaths from "~/imports/svg-register";
import googleIcon from "~/imports/google-icon.svg";

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    fullName?: string;
  }>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate email
    if (!email) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!validateEmail(email)) {
      newErrors.email = "Email không đúng định dạng";
    }

    // Validate full name
    if (!fullName) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    } else if (fullName.length < 2) {
      newErrors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }

    // Validate password
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (password.length > 50) {
      newErrors.password = "Mật khẩu không được quá 50 ký tự";
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // In a real app, this would call an API
      alert(`Đăng ký thành công!\nEmail: ${email}\nHọ tên: ${fullName}`);
      navigate("/login");
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
      {/* Header */}
      <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.8)] border-b border-[rgba(216,222,226,0.2)] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-[#00647e] text-2xl font-normal tracking-[-1.2px]">
                FlashBuy
              </Link>
              <div className="bg-[#d8dee2] w-px h-6" />
              <h1 className="text-[#2b2f32] text-lg">Đăng ký</h1>
            </div>
            <Link to="/login" className="text-[#00647e] text-sm hover:underline">
              Trợ giúp?
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-[0px_10px_30px_-5px_rgba(0,0,0,0.04),0px_20px_25px_-5px_rgba(0,0,0,0.03)] border border-[#f1f5f9] p-10 w-full max-w-[440px]">
          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-[30px] text-[#2b2f32] tracking-[-0.75px] leading-[36px] mb-2">
              Đăng ký
            </h2>
            <p className="text-[#585c5f] text-base">
              Bắt đầu hành trình mua sắm tuyệt vời của bạn
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-[#585c5f] text-xs uppercase tracking-[1.2px] mb-2 ml-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) {
                    setErrors({ ...errors, fullName: undefined });
                  }
                }}
                placeholder="Nhập họ và tên của bạn"
                className={`w-full bg-[#edf1f4] rounded-lg px-4 py-3.5 text-base focus:outline-none focus:ring-2 ${
                  errors.fullName
                    ? "ring-2 ring-red-500 focus:ring-red-500"
                    : "focus:ring-[#0ACDFF]"
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[#585c5f] text-xs uppercase tracking-[1.2px] mb-2 ml-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined });
                  }
                }}
                placeholder="Nhập email của bạn"
                className={`w-full bg-[#edf1f4] rounded-lg px-4 py-3.5 text-base focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "ring-2 ring-red-500 focus:ring-red-500"
                    : "focus:ring-[#0ACDFF]"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#585c5f] text-xs uppercase tracking-[1.2px] mb-2 ml-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined });
                  }
                }}
                placeholder="Nhập mật khẩu"
                className={`w-full bg-[#edf1f4] rounded-lg px-4 py-3.5 text-base focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "ring-2 ring-red-500 focus:ring-red-500"
                    : "focus:ring-[#0ACDFF]"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[#585c5f] text-xs uppercase tracking-[1.2px] mb-2 ml-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors({ ...errors, confirmPassword: undefined });
                  }
                }}
                placeholder="Nhập lại mật khẩu"
                className={`w-full bg-[#edf1f4] rounded-lg px-4 py-3.5 text-base focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? "ring-2 ring-red-500 focus:ring-red-500"
                    : "focus:ring-[#0ACDFF]"
                }`}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#00cbfd] hover:bg-[#00b8e8] text-[#003e4f] font-normal py-3 rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,203,253,0.2),0px_4px_6px_-4px_rgba(0,203,253,0.2)] transition-colors"
            >
              Tiếp theo
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-[rgba(216,222,226,0.5)]" />
            <span className="px-4 text-[#73777a] text-xs uppercase tracking-[1.2px]">Hoặc</span>
            <div className="flex-1 h-px bg-[rgba(216,222,226,0.5)]" />
          </div>

          {/* Social Logins */}
          <div className="space-y-3 mb-8">
            <button className="w-full bg-[#edf1f4] hover:bg-[#e0e6ea] rounded-lg py-3 flex items-center justify-center gap-3 transition-colors">
              <img src={googleIcon} alt="Google" className="w-5 h-5" />
              <span className="text-[#2b2f32]">Đăng ký bằng Google</span>
            </button>
            <button className="w-full bg-[#edf1f4] hover:bg-[#e0e6ea] rounded-lg py-3 flex items-center justify-center gap-3 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
                <path d={svgPaths.p3db23880} fill="#1877F2" />
              </svg>
              <span className="text-[#2b2f32]">Đăng ký bằng Facebook</span>
            </button>
          </div>

          {/* Terms */}
          <div className="text-center text-xs text-[#585c5f] mb-6 leading-relaxed">
            Bằng việc đăng ký, bạn đã đồng ý với FlashBuy về{" "}
            <Link to="/terms" className="text-[#00cbfd] hover:underline">
              Điều khoản dịch vụ
            </Link>{" "}
            &{" "}
            <Link to="/privacy" className="text-[#00cbfd] hover:underline">
              Chính sách bảo mật
            </Link>
          </div>

          {/* Footer Link */}
          <div className="text-center text-sm border-t border-[rgba(216,222,226,0.3)] pt-6">
            <span className="text-[#585c5f]">Bạn đã có tài khoản? </span>
            <Link to="/login" className="text-[#00cbfd] hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8">
        <div className="max-w-[1280px] mx-auto px-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#73777a]">
          <span>© 2024 Velocity Editorial. All rights reserved.</span>
          <div className="w-1 h-1 rounded-full bg-[#aaadb0]" />
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-[#585c5f]">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#585c5f]">
              Terms of Service
            </Link>
            <Link to="/help" className="hover:text-[#585c5f]">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

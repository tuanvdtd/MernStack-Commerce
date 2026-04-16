import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import svgPaths from "~/imports/svg-login";
import imgGoogleIcon from "~/imports/google-icon.svg";
import { Footer } from "~/components/Footer";

export function Login() {
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    emailOrUsername?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate email/username
    if (!emailOrUsername) {
      newErrors.emailOrUsername = "Vui lòng nhập email hoặc tên đăng nhập";
    } else if (emailOrUsername.length < 3) {
      newErrors.emailOrUsername = "Email/Tên đăng nhập phải có ít nhất 3 ký tự";
    }

    // Validate password
    if (!password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // In a real app, this would call an API
      alert(`Đăng nhập thành công!\nEmail/Username: ${emailOrUsername}`);
      navigate("/");
    }
  };

  return (
    <div
      className="bg-[#f8fafc] min-h-screen flex flex-col"
      style={{
        backgroundImage:
          "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 1280 887.5\" xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"none\"><rect x=\"0\" y=\"0\" height=\"100%\" width=\"100%\" fill=\"url(%23grad)\" opacity=\"1\"/><defs><radialGradient id=\"grad\" gradientUnits=\"userSpaceOnUse\" cx=\"0\" cy=\"0\" r=\"10\" gradientTransform=\"matrix(90.51 0 0 62.756 640 443.75)\"><stop stop-color=\"rgba(226,232,240,1)\" offset=\"0.014731\"/><stop stop-color=\"rgba(226,232,240,0)\" offset=\"0.014731\"/></radialGradient></defs></svg>'), linear-gradient(90deg, rgb(248, 250, 252) 0%, rgb(248, 250, 252) 100%)",
      }}
    >
      {/* Header */}
      <div className="backdrop-blur-[12px] bg-[rgba(255,255,255,0.8)] border-b border-[#e2e8f0] sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-[#0891b2] text-2xl font-normal tracking-[-1.2px]">
              FlashBuy
            </Link>
            <Link to="/help" className="flex items-center gap-1 text-[#00647e] text-sm hover:underline">
              <svg className="w-[15px] h-[15px]" fill="none" viewBox="0 0 15 15">
                <path d={svgPaths.p256c25e0} fill="#00647E" />
              </svg>
              Cần trợ giúp?
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-[448px]">
          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-[0px_8px_30px_0px_rgba(0,0,0,0.04)] border border-[#f1f5f9] p-10 mb-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-[30px] text-[#2b2f32] tracking-[-0.75px] leading-[36px] mb-2">
                Đăng nhập
              </h1>
              <p className="text-[#585c5f] text-sm leading-5">
                Chào mừng bạn trở lại với FlashBuy.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email/Username */}
              <div>
                <label className="block text-[#585c5f] text-xs uppercase tracking-[0.6px] mb-1.5">
                  Email / Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) => {
                    setEmailOrUsername(e.target.value);
                    if (errors.emailOrUsername) {
                      setErrors({ ...errors, emailOrUsername: undefined });
                    }
                  }}
                  placeholder="Nhập thông tin của bạn"
                  className={`w-full bg-[#f8fafc] border rounded-lg px-4 py-[17px] text-base focus:outline-none focus:ring-2 ${
                    errors.emailOrUsername
                      ? "border-red-500 ring-2 ring-red-500 focus:ring-red-500"
                      : "border-[#e2e8f0] focus:ring-[#0ACDFF] focus:border-[#0ACDFF]"
                  }`}
                />
                {errors.emailOrUsername && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.emailOrUsername}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5 px-1">
                  <label className="text-[#585c5f] text-xs uppercase tracking-[0.6px]">
                    Mật khẩu
                  </label>
                  <Link to="/forgot-password" className="text-[#00647e] text-xs hover:underline">
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors({ ...errors, password: undefined });
                      }
                    }}
                    placeholder="Nhập mật khẩu"
                    className={`w-full bg-[#f8fafc] border rounded-lg px-4 py-[17px] pr-12 text-base focus:outline-none focus:ring-2 ${
                      errors.password
                        ? "border-red-500 ring-2 ring-red-500 focus:ring-red-500"
                        : "border-[#e2e8f0] focus:ring-[#0ACDFF] focus:border-[#0ACDFF]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#73777a] hover:text-[#585c5f]"
                  >
                    <svg className="w-[18px] h-[16.5px]" fill="none" viewBox="0 0 18.3333 16.5">
                      <path d={svgPaths.pf0742c0} fill="currentColor" />
                    </svg>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00647e] to-[#00576e] hover:from-[#00576e] hover:to-[#004a5e] text-white py-4 rounded-lg shadow-[0px_10px_15px_-3px_rgba(0,100,126,0.1),0px_4px_6px_-4px_rgba(0,100,126,0.1)] transition-all text-sm uppercase tracking-[1.4px] font-normal"
              >
                ĐĂNG NHẬP
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#f1f5f9]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-[#94a3b8] text-xs uppercase tracking-[1.2px]">
                  HOẶC
                </span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4 mb-7">
              <button className="bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] rounded-lg py-3 flex items-center justify-center gap-3 transition-colors">
                <img src={imgGoogleIcon} alt="Google" className="w-5 h-5" />
                <span className="text-[#334155] text-sm">Google</span>
              </button>
              <button className="bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] rounded-lg py-3 flex items-center justify-center gap-3 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                  <path d={svgPaths.p9653980} fill="#1877F2" />
                </svg>
                <span className="text-[#334155] text-sm">Facebook</span>
              </button>
            </div>

            {/* Footer Link */}
            <div className="text-center text-sm pt-2">
              <span className="text-[#585c5f]">Bạn mới biết đến FlashBuy? </span>
              <Link to="/register" className="text-[#00647e] hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </div>

          {/* Branding */}
          <div className="flex items-center justify-center gap-8 opacity-30">
            <svg className="w-[30px] h-6" fill="none" viewBox="0 0 30.0025 24">
              <path d={svgPaths.p36052100} fill="#2B2F32" />
            </svg>
            <svg className="w-6 h-[30px]" fill="none" viewBox="0 0 24 30">
              <path d={svgPaths.p150a3c80} fill="#2B2F32" />
            </svg>
            <svg className="w-6 h-[30px]" fill="none" viewBox="0 0 24 30">
              <path d={svgPaths.p3d5d680} fill="#2B2F32" />
            </svg>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

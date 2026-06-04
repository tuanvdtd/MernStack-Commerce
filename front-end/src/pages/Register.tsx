import { useState } from "react";
import { Link, useNavigate } from "react-router";
import googleIcon from "~/imports/google-icon.svg";
import { googleLoginUrl } from "~/apis/authApi";
import { userStore } from "~/stores/userStore";
import { Footer } from "~/components/Footer";

export function Register() {
  const navigate = useNavigate();
  const { signUp, error, setError, loading } = userStore();

  const [formData, setFormData] = useState({
    email: "",
  });

  const handleSigninClick = () => {
    navigate("/login");
  };

  const handleGoogleSignIn = () => {
    window.location.href = googleLoginUrl();
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSignUp = async () => {
    const email = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Vui long nhap dung dinh dang email");
      return;
    }

    const ok = await signUp({ email });
    if (ok) {
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen flex flex-col">
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
              Cần trợ giúp?
            </Link>
          </div>
        </div>
      </div>

      <div className="flex h-[700px] items-center justify-center bg-gray-100">
        <div className="bg-white w-[400px] p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Tạo tài khoản mới</h1>

          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="a@gmail.com"
              className="w-full border rounded-md px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <button
            type="button"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition mb-4 disabled:opacity-60"
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
          </button>

          <button
            type="button"
            className="w-full bg-gray-100 flex items-center justify-center py-2 rounded-md font-medium hover:bg-gray-200 transition mb-4"
            onClick={handleGoogleSignIn}
          >
            <img src={googleIcon} alt="Google Logo" className="w-5 h-5 mr-2" />
            Đăng ký với Google
          </button>

          <p className="text-sm text-center text-gray-500">
            Bạn đã có tài khoản?{" "}
            <button onClick={handleSigninClick} className="text-blue-500 hover:underline">
              Đăng nhập
            </button>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

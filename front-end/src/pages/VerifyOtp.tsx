import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Info, Mail } from 'lucide-react'

import { OtpInput } from '~/components/OtpInput'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { userStore } from '~/stores/userStore'

const RESEND_COOLDOWN_SEC = 60
const OTP_EXPIRY_MINUTES = 5

export function VerifyOtp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const emailParam = searchParams.get('email') ?? ''

  const { verifyOtp, resendOtp, error, setError, loading } = userStore()

  const [email, setEmail] = useState(emailParam)
  const [otp, setOtp] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    setError(null)
  }, [setError])

  useEffect(() => {
    if (!emailParam) {
      navigate('/register', { replace: true })
    }
  }, [emailParam, navigate])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleVerify = async () => {
    setSuccessMessage(null)
    if (!email.trim()) {
      setError('Vui lòng nhập email')
      return
    }
    if (otp.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số OTP')
      return
    }

    const ok = await verifyOtp(email.trim(), otp)
    if (ok) {
      navigate(`/login?verifiedEmail=${encodeURIComponent(email.trim())}`, { replace: true })
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0 || !email.trim()) return
    setSuccessMessage(null)
    const ok = await resendOtp(email.trim())
    if (ok) {
      setSuccessMessage('Mã OTP mới đã được gửi đến email của bạn.')
      setOtp('')
      setResendCooldown(RESEND_COOLDOWN_SEC)
    }
  }

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
              <h1 className="text-[#2b2f32] text-lg">Xác thực tài khoản</h1>
            </div>
            <Link to="/login" className="text-[#00647e] text-sm hover:underline">
              Trợ giúp?
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-gray-100 py-12">
        <div className="bg-white w-[420px] p-8 rounded-lg shadow-md">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-blue-50 p-3">
              <Mail className="size-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2 text-center">Nhập mã OTP</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Chúng tôi đã gửi mã 6 chữ số đến email của bạn. Mã có hiệu lực trong{' '}
            <strong>{OTP_EXPIRY_MINUTES} phút</strong>.
          </p>

          <Alert variant="info" className="mb-4">
            <Info className="size-4" />
            <AlertDescription>
              Kiểm tra hộp thư đến và thư mục spam nếu bạn chưa nhận được email.
            </AlertDescription>
          </Alert>

          {successMessage && (
            <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-md text-sm">
              {successMessage}
            </div>
          )}

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
              readOnly={!!emailParam}
              className="w-full border rounded-md px-4 py-2 mt-1 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Mã OTP
            </label>
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          </div>

          <button
            type="button"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition mb-4 disabled:opacity-60"
            disabled={loading || otp.length !== 6}
            onClick={handleVerify}
          >
            {loading ? 'Đang xác thực...' : 'Xác thực tài khoản'}
          </button>

          <p className="text-sm text-center text-gray-500 mb-2">
            Không nhận được mã?{' '}
            <button
              type="button"
              className="text-blue-500 hover:underline disabled:text-gray-400 disabled:no-underline"
              disabled={loading || resendCooldown > 0}
              onClick={handleResend}
            >
              {resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 'Gửi lại mã OTP'}
            </button>
          </p>

          <p className="text-sm text-center text-gray-500">
            <Link to="/login" className="text-blue-500 hover:underline">
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>

      <div className="py-8">
        <div className="max-w-[1280px] mx-auto px-8 flex flex-wrap items-center justify-center gap-4 text-xs text-[#73777a]">
          <span>© 2024 Velocity Editorial. All rights reserved.</span>
        </div>
      </div>
    </div>
  )
}

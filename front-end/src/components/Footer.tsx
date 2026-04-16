import { Link } from "react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { Instagram, Youtube } from '@thesvg/react';
import facebookSvg from "~/imports/fb-icon.svg";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">FlashBuy</h3>
            <p className="text-sm mb-4">
              Mua sắm thông minh, giá tốt mỗi ngày. Nền tảng thương mại điện tử uy tín tại Việt Nam.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-[#0ACDFF] transition-colors">
               <img src={facebookSvg} alt="Facebook" className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#0ACDFF] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-[#0ACDFF] transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/category/all" className="hover:text-[#0ACDFF] transition-colors">
                  Danh mục sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/flash-sale" className="hover:text-[#0ACDFF] transition-colors">
                  Flash Sale
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-[#0ACDFF] transition-colors">
                  Theo dõi đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-[#0ACDFF] transition-colors">
                  Tài khoản
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-white font-semibold mb-4">Chính sách</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-[#0ACDFF] transition-colors">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0ACDFF] transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0ACDFF] transition-colors">
                  Chính sách vận chuyển
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#0ACDFF] transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>123 Nguyễn Văn Linh, Q.7, TP.HCM</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>support@flashbuy.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 FlashBuy. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

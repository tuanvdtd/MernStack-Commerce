import { Link } from "react-router";
import { Home, Search } from "lucide-react";

export function NotFound() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-xl shadow-sm p-12">
          <div className="text-9xl font-bold text-[#0ACDFF] mb-4">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Không tìm thấy trang</h1>
          <p className="text-gray-600 mb-8">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center bg-[#0ACDFF] hover:bg-[#09b8e8] text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Về trang chủ
            </Link>
            <Link
              to="/category/all"
              className="inline-flex items-center justify-center border-2 border-[#0ACDFF] text-[#0ACDFF] hover:bg-[#0ACDFF] hover:text-white px-8 py-3 rounded-xl font-semibold transition-all"
            >
              <Search className="w-5 h-5 mr-2" />
              Khám phá sản phẩm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

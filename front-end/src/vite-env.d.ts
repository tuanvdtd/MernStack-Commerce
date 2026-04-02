/*file này có tác dụng khai báo các kiểu dữ liệu toàn cục, 
  *giúp TypeScript hiểu được các loại module và biến toàn cục mà chúng ta sử dụng trong dự án.
  * Ví dụ, khi chúng ta sử dụng các biến môi trường được định nghĩa trong Vite,
  * chúng ta có thể khai báo chúng ở đây để TypeScript không báo lỗi khi chúng ta truy cập vào chúng trong mã nguồn.
  * Ngoài ra, nếu chúng ta sử dụng các module hoặc thư viện bên ngoài mà không có kiểu dữ liệu tương ứng,
  * chúng ta cũng có thể khai báo các kiểu dữ liệu đó ở đây để tránh lỗi khi biên dịch.
*/
/// <reference types="vite/client" />
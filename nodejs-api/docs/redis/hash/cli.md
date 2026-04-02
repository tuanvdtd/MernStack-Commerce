# Redis Hash Cheat Sheet

---

## 1. Khái niệm Hash trong Redis

Redis Hash là một cấu trúc dữ liệu dạng **key-value**, trong đó mỗi key chứa một tập các field và value, giống như một object hoặc dictionary.

Phù hợp để lưu trữ:

* Object người dùng
* Cấu hình
* Profile
* Thông tin sản phẩm

---

## 2. Tạo và cập nhật Hash

```redis
HSET user:1 name "tuan" age 21
# => 2 field được set

HSET user:1 email "tuan@example.com"
# => thêm field mới
```

---

## 3. Lấy dữ liệu Hash

```redis
HGET user:1 name
# => "tuan"

HMGET user:1 name age
# => "tuan" 21

HGETALL user:1
# => trả về tất cả field và value
```

---

## 4. Đếm số field

```redis
HLEN user:1
# => số field trong hash
```

---

## 5. Kiểm tra field tồn tại

```redis
HEXISTS user:1 email
# => 1 nếu có, 0 nếu không có
```

---

## 6. Xóa field trong Hash

```redis
HDEL user:1 email
# => xóa field
```

---

## 7. Lấy danh sách field hoặc value

```redis
HKEYS user:1
# => trả về danh sách field

HVALS user:1
# => trả về danh sách value
```

---

## 8. Tăng/giảm giá trị trong Hash

Thường dùng cho các counter trong object.

```redis
HINCRBY product:1001 stock 5
# tăng stock lên 5

HINCRBY product:1001 stock -2
# giảm stock 2
```

---

## 9. Hash cho cache object

### Ví dụ: Lưu thông tin user

```redis
HSET user:2 name "Minh" age 22 email "minh@gmail.com"
```

### Đọc user

```redis
HGETALL user:2
```

---

## 10. Hash trong thực tế

### Lưu cấu hình

```redis
HSET config:website title "My Shop" theme "dark"
```

### Lưu thông tin sản phẩm

```redis
HSET product:101 name "Áo thun" price 200000 stock 15
```

### Làm cache object hiệu quả hơn String

* Tiết kiệm bộ nhớ hơn JSON
* Truy cập từng field không cần parse JSON

---

##  Ví dụ cache thực tế: làm giỏ hàng

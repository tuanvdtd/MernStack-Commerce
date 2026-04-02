# Redis Set Cheat Sheet

---

## 1. Khái niệm Set trong Redis

Redis Set là cấu trúc dữ liệu dạng **tập hợp không trùng lặp**, tương tự như Set trong nhiều ngôn ngữ lập trình.

Đặc điểm:

* Không có phần tử trùng lặp
* Thứ tự không được đảm bảo
* Tìm kiếm, thêm, xóa rất nhanh (O(1))

Phù hợp cho:

* Lưu danh sách unique
* Tag, sở thích, categories
* Bạn bè, follower list
* Loại bỏ trùng lặp

---

## 2. Thêm phần tử vào Set

```redis
SADD users 1 2 3
SADD users 3
# 3 đã tồn tại nên không thêm
```

---

## 3. Lấy tất cả phần tử trong Set

```redis
SMEMBERS users
```

---

## 4. Kiểm tra phần tử tồn tại

```redis
SISMEMBER users 2
# => 1

SISMEMBER users 10
# => 0
```

---

## 5. Đếm số phần tử

```redis
SCARD users
```

---

## 6. Xóa phần tử khỏi Set

```redis
SREM users 2
```

---

## 7. Lấy phần tử ngẫu nhiên

```redis
SRANDMEMBER users
# Lấy 1 phần tử ngẫu nhiên

SRANDMEMBER users 3
# Lấy 3 phần tử ngẫu nhiên (không xóa)
```

---

## 8. Pop phần tử (vừa lấy vừa xóa)

```redis
SPOP users
SPOP users 2
```

---

## 9. Các phép toán trên Set

Redis Set hỗ trợ các phép toán tập hợp cực mạnh:

### Union (Hợp)

```redis
SUNION set1 set2
```

### Intersect (Giao)

```redis
SINTER set1 set2
```

### Difference (Phần còn lại)

```redis
SDIFF set1 set2
```

### Move
```redis
SMOVE source destination member
```

### Lưu kết quả trực tiếp vào Set khác

```redis
SUNIONSTORE result set1 set2
SINTERSTORE result set1 set2
SDIFFSTORE result set1 set2
```

---

## 10. Ứng dụng thực tế

### Lưu danh sách bạn bè / followers

```redis
SADD user:1:followers 2 3 4
SADD user:2:followers 3 5
```

### Tìm bạn chung (mutual friends)

```redis
SINTER user:1:followers user:2:followers
```

### Lưu tags cho bài viết

```redis
SADD blog:1001:tags tech nodejs backend
```

### Tìm bài viết có chung tags

```redis
SINTER blog:1001:tags blog:1002:tags
```

### Lưu danh sách IP duy nhất truy cập

```redis
SADD visited:ips 1.1.1.1 1.1.1.2 1.1.1.1
# IP trùng sẽ tự bỏ qua
```

---

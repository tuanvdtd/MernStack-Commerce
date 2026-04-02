# Redis List Cheat Sheet

---

## 1. Khái niệm List trong Redis

Redis List là cấu trúc dữ liệu dạng **danh sách liên kết** (linked list), cho phép thêm/xóa phần tử ở **đầu** hoặc **cuối** rất nhanh.

Phù hợp cho:

* Hàng đợi (queue)
* Stack (ngăn xếp)
* Log / message stream đơn giản
* Lưu lịch sử hoạt động

---

## 2. Thêm phần tử vào List

```redis
LPUSH queue 1 2 3
# Thêm vào đầu: List => 3, 2, 1

RPUSH queue 4 5
# Thêm vào cuối: List => 3, 2, 1, 4, 5
```

---

## 3. Lấy phần tử từ List

```redis
LPOP queue
# Lấy phần tử đầu

RPOP queue
# Lấy phần tử cuối
```

---

## 4. Xem phần tử theo chỉ mục

```redis
LINDEX queue 0
# => phần tử đầu tiên

LINDEX queue -1
# => phần tử cuối
```

---

## 5. Lấy danh sách (range)

```redis
LRANGE queue 0 -1
# Lấy toàn bộ list

LRANGE queue 0 2
# Lấy từ index 0 đến 2
```

---

## 6. Độ dài List

```redis
LLEN queue
# => trả về số phần tử
```

---

## 7. Chèn vào trước/sau phần tử

```redis
LINSERT queue BEFORE 2 99
LINSERT queue AFTER 1 88
```

---

## 8. Gán giá trị cho index

```redis
LSET queue 0 100
# Ghi đè phần tử đầu
```

---

## 9. Loại bỏ phần tử theo giá trị

```redis
LREM queue 2 3
# Xóa tối đa 2 phần tử có giá trị '3'
```

---

## 10. Cắt danh sách (trim)

Giữ lại từ index L đến R, xóa phần còn lại.

```redis
LTRIM queue 0 2
# Chỉ giữ lại 3 phần tử đầu
```

---

## 11. Blocking pop (tạo hàng đợi thực thụ)

Dùng khi muốn chờ đến khi có phần tử mới.

```redis
BLPOP queue 10
# Đợi tối đa 10 giây để lấy phần tử đầu

BRPOP queue 10
# Đợi tối đa 10 giây để lấy phần tử cuối
```

---

## 12. Ứng dụng thực tế

### Hàng đợi xử lý order

```redis
RPUSH order:queue order_101
RPUSH order:queue order_102

BLPOP order:queue 0
# => Lấy order để xử lý
```

### Lưu log hoạt động

```redis
LPUSH activity:logs "user 1 login"
LPUSH activity:logs "user 1 viewed product 21"
LTRIM activity:logs 0 50
# Chỉ giữ 50 log gần nhất
```

### Stack (ngăn xếp)

```redis
LPUSH stack 10
LPUSH stack 20
LPOP stack
# => 20
```

---

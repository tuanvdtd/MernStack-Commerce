# 🚀 Redis Transactions — Tổng Hợp Đầy Đủ & Dễ Hiểu

Redis Transactions cho phép gom nhiều lệnh lại thành **một nhóm nguyên tử**, đảm bảo các lệnh được **thực thi tuần tự** và **không bị chen ngang** bởi client khác.

---

# 1. 🔥 Tổng quan về Transaction trong Redis

Một transaction trong Redis gồm 3 bước:

1. **Bắt đầu** bằng `MULTI`
2. **Xếp lệnh vào queue**
3. **Thực thi** bằng `EXEC`

---

# 2. 🔥 MULTI — Bắt đầu Transaction

Lệnh `MULTI` đưa Redis vào chế độ **transaction queue**.

- Các lệnh sau `MULTI` **không chạy ngay**
- Redis chỉ **xếp lệnh vào hàng đợi**
- Chờ đến khi gọi `EXEC`

```redis
MULTI
SET a 10
INCR a
```

---
# 3. 🔥 EXEC — Thực thi transaction
```redis
MULTI
SET a 10
INCR a
EXEC
```

Hủy toàn bộ lệnh đang trong queue:

MULTI
SET a 10
DISCARD

WATCH — Optimistic Locking

WATCH giúp phát hiện key bị thay đổi trong lúc bạn xử lý logic.

Cơ chế:

WATCH key

Đọc giá trị → xử lý bên ngoài

MULTI và EXEC

Nếu key bị client khác sửa → EXEC trả null

→ phải retry.

ví dụ: 
WATCH product:1001:stock
stock = GET product:1001:stock

if stock > 0:
    MULTI
    DECR product:1001:stock
    EXEC
else:
    UNWATCH
    (Out of stock)

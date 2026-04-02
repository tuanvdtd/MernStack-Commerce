# Redis CLI Cheat Sheet

---

## 1. Lưu trữ String

```redis
SET str 123456789012345678901234567890123456789abcd
# object encoding str => embstr (44 bytes)

SET str2 123456789012345678901234567890123456789abcdabcd
# object encoding str2 => raw (>44 bytes)

SET num 1234
# object encoding num => int
```

---

## 2. Các thao tác cơ bản với String

```redis
SET name tuandt
# => OK

GET name
# => tuandt

STRLEN name
# => 6

EXISTS name
# => 1

DEL name
# => OK
```

---

## 3. Multi-set / Multi-get

```redis
MSET key1 value1 key2 value2 ...
MGET key1 key2
```

---

## 4. Tăng / giảm số

```redis
SET 0001:like 0

INCR 0001:like
GET 0001:like
# => 1

INCRBY 0001:like 8
# tương tự DECRBY
```

---

## 5. Truy vấn khóa

```redis
KEYS '001:*'
```

---

## 6. Thiết lập thời gian hết hạn

```redis
EXPIRE key time
TTL key
# => trả về thời gian còn lại

# Kết hợp:
SET key value EX time
```

---

## 7. SETNX (Set if Not Exists)

```redis
SETNX key value
# Nếu key tồn tại => không set
# Nếu key không tồn tại => set thành công
```

---

## 8. Ví dụ cache thực tế

### Cách 1: Lưu object JSON

```redis
SET user:1 '{"name": "tuan", "age": 21}'
```

### Cách 2: Lưu theo từng field

```redis
MSET user:1:name tuan user:1:age 21
```

### Sử dụng String để đếm lượt

```redis
SET blog:readcount:1001 0
GET blog:readcount:1001
# => 0

INCRBY blog:readcount:1001 10
# => 10
```

### Dùng làm khóa phân tán

```redis
# Ví dụ trong phần order của project
```

---

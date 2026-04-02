# Redis Sorted Set (ZSET) Cheat Sheet

---

## 1. Khái niệm Sorted Set (ZSET)

Redis Sorted Set là tập hợp các phần tử **không trùng lặp**, mỗi phần tử có kèm theo **score** (điểm số). Redis sẽ tự động **sắp xếp** theo score từ thấp → cao.

Phù hợp cho:

* Bảng xếp hạng (leaderboard)
* Top N
* Lịch trình (scheduling)
* Sắp xếp theo thời gian, điểm, lượt xem

---

## 2. Thêm phần tử vào ZSET

```redis
ZADD ranking 100 user1
ZADD ranking 150 user2
ZADD ranking 120 user3
```

---

## 3. Lấy danh sách theo thứ tự tăng dần

```redis
ZRANGE ranking 0 -1
# => user1 user3 user2
```

Lấy kèm score:

```redis
ZRANGE ranking 0 -1 WITHSCORES
```

---

## 4. Lấy danh sách theo thứ tự giảm dần

```redis
ZREVRANGE ranking 0 -1
```

---

## 5. Lấy vị trí (rank)

Rank tăng dần:

```redis
ZRANK ranking user3
```

Rank giảm dần:

```redis
ZREVRANK ranking user3
```

---

## 6. Lấy score của phần tử

```redis
ZSCORE ranking user2
# => 150
```

---

## 7. Lấy phần tử theo khoảng rank

```redis
ZRANGE ranking 0 2
ZRANGE ranking 0 10 WITHSCORES
```

---

## 8. Lấy phần tử theo khoảng score

```redis
ZRANGEBYSCORE ranking 100 200
ZRANGEBYSCORE ranking 50 150 WITHSCORES
```

---

## 9. Tăng điểm (score)

```redis
ZINCRBY ranking 20 user1
# Tăng score của user1 lên 20
```

---

## 10. Xóa phần tử khỏi ZSET

```redis
ZREM ranking user3
```

---

## 11. Xóa theo rank

```redis
ZREMRANGEBYRANK ranking 0 1
```

---

## 12. Xóa theo score

```redis
ZREMRANGEBYSCORE ranking 0 100
```

---

## 13. Ứng dụng thực tế

### Bảng xếp hạng game

```redis
ZADD game:leaderboard 1200 player1
ZADD game:leaderboard 1400 player2
ZREVRANGE game:leaderboard 0 9 WITHSCORES
# Top 10
```

### Sắp xếp bài viết theo lượt xem

```redis
ZINCRBY blog:views 1 post:101
ZINCRBY blog:views 1 post:102
ZREVRANGE blog:views 0 4
# Top 5 bài viết
```

### Scheduling (chạy task theo timestamp)

```redis
ZADD tasks 1731300000 task123
ZRANGEBYSCORE tasks -inf 1731300000
# Lấy các task đến hạn
```

---

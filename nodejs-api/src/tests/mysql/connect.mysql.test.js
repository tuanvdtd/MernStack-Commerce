const e = require('express');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',        // vì bạn kết nối từ máy host
    port: 8822,               // port đã map từ container
    user: 'root',             // hoặc user bạn cấu hình
    password: 'tuandt',
    database: 'test',
    waitForConnections: true,
    connectionLimit: 10,      // tùy chỉnh
    queueLimit: 0
});

const batchSize = 1000; // Số bản ghi chèn trong mỗi lô
const totalRecords = 10000; // Tổng số bản ghi cần chèn

let currentIndex = 1;

console.time("TIMER");
async function insertTestData() {
  // Tạo mảng giá trị để chèn
  const values = [];
  for (let i = 0; i < batchSize && currentIndex <= totalRecords; i++) {
    const name = `Name ${currentIndex}`;
    const email = `Email${currentIndex}@gmail.com`;
    values.push([name, email]);
    currentIndex++;
  }
  // Nếu không còn dữ liệu để chèn, kết thúc quá trình
  if (!values.length) {
    console.timeEnd("TIMER");
    pool.end(err => {
      if (err) {
        console.error('Error closing the pool:', err);
      } else {
        console.log('Pool closed.');
      }
    });
    return;
  }
  // Chuẩn bị câu lệnh INSERT với nhiều giá trị
  const sql = 'INSERT INTO test_user (name, email) VALUES ?';
  try {
    const [result] = await pool.query(sql, [values]);
    console.log(`Inserted ${result.affectedRows} rows.`);
    await insertTestData(); // Gọi đệ quy để chèn lô tiếp theo
  } catch (err) {
    console.error('Error inserting data:', err);
  }
}

insertTestData();

module.exports = pool;



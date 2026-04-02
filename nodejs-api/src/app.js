import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import { Router_V1 } from './router/v1/index.js';
import connectMongoDBLV0 from './dbs/init.mongodb.lv0.js';
import cookieParser from 'cookie-parser';
import { RedisDB } from './dbs/init.redis.js'

const app = express();

// init middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


/*
  helmet bảo vệ ứng dụng khỏi một số lỗ hổng bảo mật phổ biến bằng cách thiết lập các header HTTP phù hợp
*/
app.use(helmet());

/*
  morgan logger, trả về log khác nhau tùy theo môi trường
*/
app.use(morgan('dev'));

/*
  compression giúp nén các response để giảm băng thông
*/
app.use(compression());

// init database
// Nếu viết code connectMongoDBLV0 dưới dạng function thì gọi như sau:
// connectMongoDBLV0();
// thay bằng import file init.mongodb.js nếu muốn dùng "Pro" singleton
import './dbs/init.mongodb.js'

// test product service
// import './tests/inventory.test.js'
// import { productServiceTest } from './tests/product.test.js'

RedisDB.initRedis();
// Đợi Redis kết nối xong trước khi test
// setTimeout(() => {
//   productServiceTest.purchaseProduct('prod-1001', 3);
// }, 2000);

// init routes

/*
* Test compression khi không dùng và khi dùng compression middleware
app.get('/', (req, res) => {
  const compressMess = 'Res';
  return res.status(200).json({ 
    message: `Welcome to the API service`,
    metadata: compressMess.repeat(10000) 
  });
});
*/

app.use('/v1', Router_V1)
// app.use('/v2', Router_V2)

// handle errors bên ngoài route requests, khi chạy qua tất cả router mà không khớp thì chạy vào lỗi này
app.use((req, res, next) => {
  // catch 404 and forward to error handler
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

// Khi có lỗi xảy ra trong quá trình xử lý request bất kỳ gọi đến next(error), hàm này sẽ bắt lỗi và trả về response lỗi
app.use((error, req, res, next) => {
  // handle errors
  const statusCode = error.status || 500
  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    stack: error.stack,
    message: error.message || 'Internal Server Error'
  })
});

export default app;
import mongoose from "mongoose"
import os from "os";
import process from "process";

const _SECONDS = 5000;
const countConnect = () => {
  const numConnections = mongoose.connections.length
  console.log(`Số kết nối hiện tại: ${numConnections}`)
}

const checkOverload = () => {
  setInterval(() => {
    const numConnections = mongoose.connections.length
    const numCores = os.cpus().length
    const memoryUsage = process.memoryUsage().rss
    // giả sử max connections là 5 per core
    const maxConnections = 5 * numCores
    console.log('Số kết nối hiện tại', numConnections)
    console.log('Memory usage', memoryUsage/(1024*1024), 'MB')

    if (numConnections > maxConnections) {
      console.warn(`Cảnh báo: Số kết nối (${numConnections}) vượt quá giới hạn tối đa (${maxConnections})`)
    }
  }, _SECONDS);
}

const checkDB = {
  countConnect,
  checkOverload
}

export default checkDB;
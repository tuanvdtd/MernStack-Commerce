import app from "./src/app.js";
import configEnv from "./src/configs/config.mongodb.js";

const server = app.listen(configEnv.app.port, () => {
  console.log(`Server is running on port ${configEnv.app.port}`);
})

// ctrC to stop server
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server closed');
  });
})

export default server;


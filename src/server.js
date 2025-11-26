const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const http = require("http");
const { initSocket } = require("./socket/socketController");
//middlewares
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errHandler");
const matchStore = require("./socket/matchStore")
require("dotenv").config();
//job
const {parentAllGameScheduler}=require("./jobs/matchJob")

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan("dev"));

-
app.get("/", (req, res) => {
  return res.status(200).json({ msg: "🚀 Welcome to Socket.IO Service" });
});

app.use(notFound);
app.use(errorHandler);

// --- HTTP Server & Socket.IO ---
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);
parentAllGameScheduler();

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

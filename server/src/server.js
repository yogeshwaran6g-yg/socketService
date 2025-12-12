// IMPORTANT: Sentry must be initialized before anything else
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = 
require("@sentry/profiling-node");

Sentry.init({
  dsn: "https://b7103c34412caeee9661339247df0232@o4510458469613568.ingest.us.sentry.io/4510486779265024",
  integrations: [
    nodeProfilingIntegration(),
  ],
  enableLogs: true,
  tracesSampleRate: 1.0,
  profileSessionSampleRate: 1.0,
  profileLifecycle: "trace",
  sendDefaultPii: true,
});

// require("./jobs/fixedWinnerJob"); //cron init
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const http = require("http");
const { initSocket } = require("./controller/socketController");
//middlewares
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errHandler");
const matchStore = require("./store/matchStore")
require("dotenv").config();
//job
const { parentAllGameScheduler }=require("./jobs/matchJob")

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: "*"
    // ["http://localhost:3000"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan("combined"));



app.get("/", (req, res) => {
  return res.status(200).json({ msg: "🚀 Welcome to Socket.IO Service" });
});


// sentry io maual test
app.get("/debug-sentry", (req, res) => {
  Sentry.logger.info("User triggered test error");
  Sentry.metrics.count("test_counter", 1);
  throw new Error("My first Sentry profiling error!");
});

// Register Sentry ERROR HANDLER before your own global error handlers
Sentry.setupExpressErrorHandler(app);

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

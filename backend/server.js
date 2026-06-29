const dns=require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { initSocket } = require("./sockets/socketManager");
const startRadiusEscalationJob = require("./jobs/radiusEscalationJob");

const authRoutes = require("./routes/authRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const sosRoutes = require("./routes/sosRoutes");
const alertRoutes = require("./routes/alertRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");

connectDB();

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/volunteer", volunteerRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

initSocket(httpServer, CLIENT_URL);
startRadiusEscalationJob();

httpServer.listen(PORT, () => {
  console.log(`Accident SOS API + Socket.IO server running on port ${PORT}`);
});

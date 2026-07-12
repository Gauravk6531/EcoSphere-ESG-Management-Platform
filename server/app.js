require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");

const coreRoutes = require("./routes/coreRoutes");
const environmentalRoutes = require("./routes/environmentalRoutes");
const socialRoutes = require("./routes/socialRoutes");
const governanceRoutes = require("./routes/governanceRoutes");
const gamificationRoutes = require("./routes/gamificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ status: "ok", service: "EcoSphere ESG Management Platform API" }));
app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.use("/api", coreRoutes);
app.use("/api/environmental", environmentalRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/governance", governanceRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api", dashboardRoutes);

app.use(errorHandler);

module.exports = app;

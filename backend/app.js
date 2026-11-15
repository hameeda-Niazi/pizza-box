const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { createClient } = require("redis");
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const seedProducts = require("./config/seedProducts");
const ensureAdmin = require("./config/ensureAdmin");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const contactRoutes = require("./routes/contactRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const upload = require("./config/upload");

const app = express();
const proxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS || "0", 10);
if (Number.isSafeInteger(proxyHops) && proxyHops > 0) {
  app.set("trust proxy", proxyHops);
}
const redisClient = process.env.REDIS_URL ? createClient({ url: process.env.REDIS_URL }) : null;
if (redisClient) {
  redisClient.on("error", () => console.error("Shared rate-limit store connection error"));
}
const createSharedRateLimitStore = (prefix) => redisClient
  ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix,
  })
  : undefined;
const parseClientOrigins = (rawValue = "") => rawValue
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const clientOrigins = parseClientOrigins(process.env.CLIENT_URL || "http://localhost:5173");
const isLocalDevelopmentOrigin = (origin) => {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const url = new URL(origin);
    const port = Number(url.port);
    return url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname) &&
      port >= 5173 && port <= 5199;
  } catch {
    return false;
  }
};
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createSharedRateLimitStore("pizza-box-auth-limit:"),
  message: { message: "Too many attempts. Please try again later." },
});
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createSharedRateLimitStore("pizza-box-contact-limit:"),
  message: { message: "Too many messages. Please try again later." },
});

const validateProductionConfiguration = () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
  if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) {
    throw new Error("JWT_SECRET must contain at least 32 bytes");
  }
  if (process.env.NODE_ENV !== "production") return;

  const configuredOrigins = parseClientOrigins(process.env.CLIENT_URL || "");
  if (configuredOrigins.length === 0) {
    throw new Error("Production CLIENT_URL must contain HTTPS origins");
  }

  let origins;
  try {
    origins = configuredOrigins.map((origin) => new URL(origin));
  } catch {
    throw new Error("Production CLIENT_URL must contain HTTPS origins");
  }

  if (origins.some((origin) => origin.protocol !== "https:")) {
    throw new Error("Production CLIENT_URL must contain HTTPS origins");
  }
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("Production administrator credentials are required");
  }
  if (Buffer.byteLength(process.env.ADMIN_PASSWORD) < 12 || Buffer.byteLength(process.env.ADMIN_PASSWORD) > 72) {
    throw new Error("ADMIN_PASSWORD must be between 12 and 72 bytes");
  }
};

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || clientOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(upload.uploadDirectory));

app.get("/", (req, res) => {
  res.status(200).json({ message: "Pizza Box API is running" });
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/contact", contactLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.code === "LIMIT_FILE_SIZE") {
    const maxFileSizeMb = Math.floor(upload.maxFileSize / (1024 * 1024));
    return res.status(400).json({ message: `Image must be smaller than ${maxFileSizeMb} MB` });
  }
  console.error(err.message);
  return res.status(err.statusCode || 500).json({
    message: err.statusCode ? err.message : "Something went wrong on the server",
  });
});

const PORT = process.env.PORT || 5000;
let initializationPromise;

const initializeApp = () => {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      validateProductionConfiguration();
      await connectDB();
      await seedProducts();
      await ensureAdmin();
      if (redisClient && !redisClient.isOpen) await redisClient.connect();
    })().catch((error) => {
      initializationPromise = undefined;
      throw error;
    });
  }
  return initializationPromise;
};

const startServer = async () => {
  await initializeApp();
  if (process.env.VERCEL) return app;

  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (require.main === module && !process.env.VERCEL) {
  startServer().catch((error) => {
    console.error(`Server failed to start: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { app, initializeApp, startServer, validateProductionConfiguration };

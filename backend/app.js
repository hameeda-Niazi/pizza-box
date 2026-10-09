// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const { rateLimit } = require("express-rate-limit");
// const { RedisStore } = require("rate-limit-redis");
// const { createClient } = require("redis");
// require("dotenv").config();

// const connectDB = require("./config/db");
// const seedProducts = require("./config/seedProducts");
// const ensureAdmin = require("./config/ensureAdmin");

// const authRoutes = require("./routes/authRoutes");
// const productRoutes = require("./routes/productRoutes");
// const orderRoutes = require("./routes/orderRoutes");
// const contactRoutes = require("./routes/contactRoutes");
// const uploadRoutes = require("./routes/uploadRoutes");
// const upload = require("./config/upload");

// const app = express();
// const proxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS || "0", 10);
// if (Number.isSafeInteger(proxyHops) && proxyHops > 0) {
//   app.set("trust proxy", proxyHops);
// }
// const redisClient = process.env.REDIS_URL ? createClient({ url: process.env.REDIS_URL }) : null;
// if (redisClient) {
//   redisClient.on("error", () => console.error("Shared rate-limit store connection error"));
// }
// const createSharedRateLimitStore = (prefix) => redisClient
//   ? new RedisStore({
//     sendCommand: (...args) => redisClient.sendCommand(args),
//     prefix,
//   })
//   : undefined;
// const clientOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
//   .split(",")
//   .map((origin) => origin.trim())
//   .filter(Boolean);
// const isLocalDevelopmentOrigin = (origin) => {
//   if (process.env.NODE_ENV === "production") return false;
//   try {
//     const url = new URL(origin);
//     const port = Number(url.port);
//     return url.protocol === "http:" &&
//       ["localhost", "127.0.0.1"].includes(url.hostname) &&
//       port >= 5173 && port <= 5199;
//   } catch {
//     return false;
//   }
// };
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit: 10,
//   standardHeaders: true,
//   legacyHeaders: false,
//   store: createSharedRateLimitStore("pizza-box-auth-limit:"),
//   message: { message: "Too many attempts. Please try again later." },
// });
// const contactLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000,
//   limit: 10,
//   standardHeaders: true,
//   legacyHeaders: false,
//   store: createSharedRateLimitStore("pizza-box-contact-limit:"),
//   message: { message: "Too many messages. Please try again later." },
// });

// const validateProductionConfiguration = () => {
//   if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required");
//   if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET) < 32) {
//     throw new Error("JWT_SECRET must contain at least 32 bytes");
//   }
//   if (process.env.NODE_ENV !== "production") return;

//   const origins = (process.env.CLIENT_URL || "").split(",").map((origin) => new URL(origin.trim()));
//   if (origins.length === 0 || origins.some((origin) => origin.protocol !== "https:")) {
//     throw new Error("Production CLIENT_URL must contain HTTPS origins");
//   }
//   if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
//     throw new Error("Production administrator credentials are required");
//   }
//   const hasCloudinary = [
//     process.env.CLOUDINARY_CLOUD_NAME,
//     process.env.CLOUDINARY_API_KEY,
//     process.env.CLOUDINARY_API_SECRET,
//   ].every(Boolean);
//   const hasPersistentHttpsUploads = process.env.UPLOADS_DIR && process.env.PUBLIC_API_URL?.startsWith("https://");
//   if (!hasCloudinary && !hasPersistentHttpsUploads) {
//     throw new Error("Configure Cloudinary or persistent HTTPS upload storage");
//   }
// };

// // Middleware
// app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || clientOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
//         return callback(null, true);
//       }
//       callback(null, false);
//     },
//   })
// );
// app.use(express.json({ limit: "1mb" }));
// app.use("/uploads", express.static(upload.uploadDirectory));

// // Home route
// app.get("/", (req, res) => {
//   res.json({
//     message: "Pizza Box API is running",
//   });
// });

// // API routes
// app.use("/api/auth/login", authLimiter);
// app.use("/api/auth/register", authLimiter);
// app.use("/api/contact", contactLimiter);
// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/contact", contactRoutes);
// app.use("/api/uploads", uploadRoutes);

// app.use((err, req, res, next) => {
//   if (err.code === "LIMIT_FILE_SIZE") {
//     return res.status(400).json({ message: "Image must be smaller than 5 MB" });
//   }
//   console.error(err.message);
//   res.status(err.statusCode || 500).json({
//     message: err.statusCode ? err.message : "Something went wrong on the server",
//   });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// let initializationPromise;

// const initializeApp = () => {
//   if (!initializationPromise) {
//     initializationPromise = (async () => {
//       validateProductionConfiguration();
//       await connectDB();
//       await seedProducts();
//       await ensureAdmin();
//       if (redisClient && !redisClient.isOpen) await redisClient.connect();
//     })().catch((error) => {
//       initializationPromise = undefined;
//       throw error;
//     });
//   }
//   return initializationPromise;
// };

// const startServer = async () => {
//   await initializeApp();
//   if (process.env.VERCEL) return app;

//   return app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// };

// if (require.main === module && !process.env.VERCEL) {
//   startServer().catch(() => {
//     console.error("Server failed to start; verify private settings and database access.");
//     process.exitCode = 1;
//   });
// }

// module.exports = { app, initializeApp, startServer, validateProductionConfiguration };




const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { createClient } = require("redis");
require("dotenv").config();

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

const proxyHops = Number.parseInt(
  process.env.TRUST_PROXY_HOPS || "0",
  10
);

if (Number.isSafeInteger(proxyHops) && proxyHops > 0) {
  app.set("trust proxy", proxyHops);
}

// Redis configuration
const redisClient = process.env.REDIS_URL
  ? createClient({ url: process.env.REDIS_URL })
  : null;

if (redisClient) {
  redisClient.on("error", () => {
    console.error("Shared rate-limit store connection error");
  });
}

const createSharedRateLimitStore = (prefix) =>
  redisClient
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix,
      })
    : undefined;

// CORS configuration
const clientOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalDevelopmentOrigin = (origin) => {
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    const url = new URL(origin);
    const port = Number(url.port);

    return (
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname) &&
      port >= 5173 &&
      port <= 5199
    );
  } catch {
    return false;
  }
};

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createSharedRateLimitStore("pizza-box-auth-limit:"),
  message: {
    message: "Too many attempts. Please try again later.",
  },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: createSharedRateLimitStore("pizza-box-contact-limit:"),
  message: {
    message: "Too many messages. Please try again later.",
  },
});

// Production configuration validation
const validateProductionConfiguration = () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required");
  }

  if (
    !process.env.JWT_SECRET ||
    Buffer.byteLength(process.env.JWT_SECRET) < 32
  ) {
    throw new Error("JWT_SECRET must contain at least 32 bytes");
  }

  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const origins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => new URL(origin));

  if (
    origins.length === 0 ||
    origins.some((origin) => origin.protocol !== "https:")
  ) {
    throw new Error(
      "Production CLIENT_URL must contain HTTPS origins"
    );
  }

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error(
      "Production administrator credentials are required"
    );
  }

  const hasCloudinary = [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ].every(Boolean);

  const hasPersistentHttpsUploads =
    process.env.UPLOADS_DIR &&
    process.env.PUBLIC_API_URL?.startsWith("https://");

  if (!hasCloudinary && !hasPersistentHttpsUploads) {
    throw new Error(
      "Configure Cloudinary or persistent HTTPS upload storage"
    );
  }
};

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        clientOrigins.includes(origin) ||
        isLocalDevelopmentOrigin(origin)
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  })
);

app.use(express.json({ limit: "1mb" }));

app.use("/uploads", express.static(upload.uploadDirectory));

// Health-check route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Pizza Box API is running",
  });
});

// API routes
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/contact", contactLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/uploads", uploadRoutes);

// Error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      message: "Image must be smaller than 5 MB",
    });
  }

  console.error(err.message);

  return res.status(err.statusCode || 500).json({
    message: err.statusCode
      ? err.message
      : "Something went wrong on the server",
  });
});

// Initialization
const PORT = process.env.PORT || 5000;
let initializationPromise;

const initializeApp = () => {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      validateProductionConfiguration();

      await connectDB();
      await seedProducts();
      await ensureAdmin();

      if (redisClient && !redisClient.isOpen) {
        await redisClient.connect();
      }
    })().catch((error) => {
      initializationPromise = undefined;
      throw error;
    });
  }

  return initializationPromise;
};

// Local development server
const startServer = async () => {
  await initializeApp();

  return app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (require.main === module && !process.env.VERCEL) {
  startServer().catch(() => {
    console.error(
      "Server failed to start; verify private settings and database access."
    );

    process.exitCode = 1;
  });
}

// Export the Express application directly for Vercel.
module.exports = app;

// Preserve access to initialization helpers if other modules use them.
module.exports.initializeApp = initializeApp;
module.exports.startServer = startServer;
module.exports.validateProductionConfiguration =
  validateProductionConfiguration;

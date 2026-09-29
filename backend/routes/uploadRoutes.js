const express = require("express");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { Readable } = require("stream");
const upload = require("../config/upload");
const { cloudinary, isConfigured: cloudinaryConfigured } = require("../config/cloudinary");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();
const uploadDirectory = upload.uploadDirectory;

const detectImageExtension = (buffer) => {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return "jpg";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  return "";
};

const extensionByMimeType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const uploadToCloudinary = (buffer, extension) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: "pizza-box/products",
      public_id: crypto.randomUUID(),
      resource_type: "image",
      format: extension,
    },
    (error, result) => {
      if (error || !result?.secure_url) return reject(new Error("Image storage failed"));
      resolve(result.secure_url);
    }
  );
  Readable.from(buffer).pipe(stream);
});

router.post("/image", protect, adminOnly, upload.single("image"), async (req, res, next) => {
  if (!req.file) return res.status(400).json({ message: "Choose a JPEG, PNG, or WebP image" });

  const extension = detectImageExtension(req.file.buffer);
  if (!extension || extension !== extensionByMimeType[req.file.mimetype]) {
    return res.status(400).json({ message: "The uploaded file is not a valid JPEG, PNG, or WebP image" });
  }

  if (cloudinaryConfigured) {
    try {
      const image = await uploadToCloudinary(req.file.buffer, extension);
      return res.status(201).json({ image });
    } catch {
      return res.status(502).json({ message: "Image storage is temporarily unavailable" });
    }
  }

  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.UPLOADS_DIR || !process.env.PUBLIC_API_URL?.startsWith("https://"))
  ) {
    return res.status(503).json({ message: "Configure Cloudinary or persistent HTTPS image storage" });
  }

  try {
    await fs.mkdir(uploadDirectory, { recursive: true });
    const filename = `${crypto.randomUUID()}.${extension}`;
    await fs.writeFile(path.join(uploadDirectory, filename), req.file.buffer, { flag: "wx" });
    const publicBaseUrl = process.env.PUBLIC_API_URL?.replace(/\/+$/, "") || `${req.protocol}://${req.get("host")}`;
    res.status(201).json({ image: `${publicBaseUrl}/uploads/${filename}` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

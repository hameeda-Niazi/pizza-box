const path = require("path");
const multer = require("multer");

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const uploadDirectory = path.resolve(
  process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads")
);
const maxFileSize = (process.env.VERCEL ? 4 : 5) * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
  fileFilter: (req, file, callback) => {
    callback(null, allowedTypes.has(file.mimetype));
  },
});

upload.uploadDirectory = uploadDirectory;
upload.maxFileSize = maxFileSize;

module.exports = upload;

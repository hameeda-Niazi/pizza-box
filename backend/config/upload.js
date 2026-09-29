const path = require("path");
const multer = require("multer");

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const uploadDirectory = path.resolve(
  process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads")
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    callback(null, allowedTypes.has(file.mimetype));
  },
});

upload.uploadDirectory = uploadDirectory;

module.exports = upload;

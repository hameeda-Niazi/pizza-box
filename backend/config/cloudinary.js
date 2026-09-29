const cloudinary = require("cloudinary").v2;

const configuration = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
};

const isConfigured = Object.values(configuration).every(Boolean);

if (isConfigured) {
  cloudinary.config(configuration);
}

module.exports = { cloudinary, isConfigured };
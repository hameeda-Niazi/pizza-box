const { app, initializeApp } = require("../app");

module.exports = async (req, res) => {
  try {
    await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error(`API initialization failed: ${error.message}`);
    if (res.headersSent) return undefined;
    return res.status(500).json({ message: "Server unavailable. Verify server configuration." });
  }
};
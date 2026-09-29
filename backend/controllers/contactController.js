const ContactMessage = require("../models/ContactMessage");

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const createMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedMessage = typeof message === "string" ? message.trim() : "";

    if (
      !normalizedName ||
      normalizedName.length > 100 ||
      !isValidEmail(normalizedEmail) ||
      !normalizedMessage ||
      normalizedMessage.length > 2000
    ) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }

    const contactMessage = await ContactMessage.create({
      name: normalizedName,
      email: normalizedEmail,
      message: normalizedMessage,
    });
    res.status(201).json({ message: "Thanks! Your message has been received.", contactMessage });
  } catch (error) {
    res.status(500).json({ message: "Unable to send your message" });
  }
};

const getMessages = async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json(messages);
};

module.exports = { createMessage, getMessages };

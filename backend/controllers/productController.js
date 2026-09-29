const Product = require("../models/Product");
const categories = new Set(["Pizzas", "Burgers", "Sides", "Wraps", "Drinks", "Desserts", "Deals"]);

const validateProductInput = (body, partial = false) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Product data is required" };
  }

  const data = {};
  for (const field of ["name", "description", "price", "category", "image", "isAvailable"]) {
    if (body[field] === undefined && partial) continue;
    if (body[field] === undefined && ["name", "price", "category"].includes(field)) {
      return { error: `${field} is required` };
    }
  }

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 100) {
      return { error: "Name must be between 1 and 100 characters" };
    }
    data.name = body.name.trim();
  }
  if (body.description !== undefined) {
    if (typeof body.description !== "string" || body.description.length > 2000) {
      return { error: "Description must be 2000 characters or fewer" };
    }
    data.description = body.description.trim();
  }
  if (body.price !== undefined) {
    const price = Number(body.price);
    if (body.price === "" || body.price === null || !Number.isFinite(price) || price < 0 || price > 10000000) {
      return { error: "Enter a valid product price" };
    }
    data.price = price;
  }
  if (body.category !== undefined) {
    if (!categories.has(body.category)) return { error: "Choose a valid product category" };
    data.category = body.category;
  }
  if (body.image !== undefined) {
    if (typeof body.image !== "string" || body.image.length > 2048) {
      return { error: "Image URL is invalid" };
    }
    if (body.image) {
      try {
        if (!["http:", "https:"].includes(new URL(body.image).protocol)) throw new Error();
      } catch {
        return { error: "Image URL must use HTTP or HTTPS" };
      }
    }
    data.image = body.image;
  }
  if (body.isAvailable !== undefined) {
    if (typeof body.isAvailable !== "boolean") return { error: "Availability must be true or false" };
    data.isAvailable = body.isAvailable;
  }

  return { data };
};

const createSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// GET ALL PRODUCTS
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
    });
  }
};

// GET SINGLE PRODUCT
const getProduct = async (req, res) => {
  try {
    if (!require("mongoose").isObjectIdOrHexString(req.params.id)) {
      return res.status(404).json({ message: "Product not found" });
    }
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get product",
    });
  }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const { data, error } = validateProductInput(req.body);
    if (error) return res.status(400).json({ message: error });

    const product = await Product.create({
      ...data,
      slug: `${createSlug(data.name)}-${Date.now().toString().slice(-6)}`,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch {
    res.status(400).json({ message: "Unable to create product" });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const { data, error } = validateProductInput(req.body, true);
    if (error) return res.status(400).json({ message: error });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      data,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch {
    res.status(400).json({ message: "Unable to update product" });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};

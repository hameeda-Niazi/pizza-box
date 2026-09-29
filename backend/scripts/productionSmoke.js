require("dotenv").config();

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const mongoose = require("mongoose");

const runId = crypto.randomBytes(8).toString("hex");
process.env.MONGO_DB_NAME = `pizzabox_smoke_${runId}`;
process.env.JWT_SECRET = crypto.randomBytes(48).toString("base64url");
process.env.ADMIN_EMAIL = `smoke-admin-${runId}@example.invalid`;
process.env.ADMIN_PASSWORD = crypto.randomBytes(24).toString("base64url");
process.env.ADMIN_NAME = "Smoke Test Administrator";
process.env.PORT = "0";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.PUBLIC_API_URL = "";
process.env.NODE_ENV = "test";
process.env.REDIS_URL = "";
process.env.UPLOADS_DIR = "";
process.env.CLOUDINARY_CLOUD_NAME = "";
process.env.CLOUDINARY_API_KEY = "";
process.env.CLOUDINARY_API_SECRET = "";

const { startServer, validateProductionConfiguration } = require("../app");
const User = require("../models/User");
const Order = require("../models/Order");
const ContactMessage = require("../models/ContactMessage");
const Product = require("../models/Product");
const seedProducts = require("../config/seedProducts");

let server;
let uploadedFilename;

const request = async (baseUrl, route, { method = "GET", token, body } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data, headers: response.headers };
};

const run = async () => {
  assert.ok(process.env.MONGO_URI, "A private MONGO_URI is required for the isolated smoke test");
  const secretRotator = require("./rotateAppSecrets");
  assert.equal(secretRotator.updateValue("A=old\nB=keep\n", "A", "new"), "A=new\nB=keep\n");
  assert.equal(secretRotator.updateValue("A=one\n", "JWT_SECRET", "private").endsWith("\n"), true);
  assert.equal(secretRotator.isValidEmail("admin@example.com"), true);
  assert.equal(secretRotator.isValidEmail("not-an-email"), false);

  process.env.NODE_ENV = "production";
  assert.throws(() => validateProductionConfiguration(), /HTTPS origins/);
  process.env.CLIENT_URL = "https://store.example.com,https://admin.example.com";
  process.env.ADMIN_EMAIL = "admin@example.com";
  process.env.ADMIN_PASSWORD = crypto.randomBytes(24).toString("base64url");
  process.env.CLOUDINARY_CLOUD_NAME = "smoke-cloud";
  process.env.CLOUDINARY_API_KEY = "smoke-key";
  process.env.CLOUDINARY_API_SECRET = "smoke-secret";
  assert.doesNotThrow(() => validateProductionConfiguration(), "Complete production settings pass startup validation");
  process.env.NODE_ENV = "test";
  process.env.ADMIN_EMAIL = `smoke-admin-${runId}@example.invalid`;
  process.env.ADMIN_PASSWORD = crypto.randomBytes(24).toString("base64url");

  server = await startServer();
  const baseUrl = `http://127.0.0.1:${server.address().port}/api`;
  const productsResponse = await request(baseUrl, "/products");
  assert.equal(productsResponse.status, 200, "Public menu API responds");
  assert.ok(productsResponse.headers.get("x-content-type-options"), "Security headers are enabled");
  assert.equal(productsResponse.headers.get("cross-origin-resource-policy"), "cross-origin", "Public uploaded images can be embedded from frontend origin");
  const developmentOriginResponse = await fetch(`${baseUrl}/products`, {
    headers: { Origin: "http://127.0.0.1:5174" },
  });
  assert.equal(developmentOriginResponse.headers.get("access-control-allow-origin"), "http://127.0.0.1:5174", "Vite fallback ports are allowed only outside production");
  process.env.NODE_ENV = "production";
  const disallowedProductionOrigin = await fetch(`${baseUrl}/products`, {
    headers: { Origin: "http://127.0.0.1:5174" },
  });
  assert.equal(disallowedProductionOrigin.headers.get("access-control-allow-origin"), null, "Production CORS rejects unconfigured origins");
  process.env.NODE_ENV = "test";
  const product = productsResponse.data.find((entry) => entry.isAvailable !== false);
  assert.ok(product, "Seeded menu products are available");
  await Product.updateOne({ _id: product._id }, { $set: { price: product.price + 10 } });
  await seedProducts();
  const preservedProduct = await Product.findById(product._id);
  assert.equal(preservedProduct.price, product.price + 10, "Startup seeding preserves administrator edits");
  product.price = preservedProduct.price;

  const customerEmail = `smoke-customer-${runId}@example.invalid`;
  const customerPassword = crypto.randomBytes(24).toString("base64url");
  const registration = await request(baseUrl, "/auth/register", {
    method: "POST",
    body: { name: "Smoke Customer", email: customerEmail, password: customerPassword, role: "admin" },
  });
  assert.equal(registration.status, 201, "Customer registration succeeds");
  assert.equal(registration.data.user.role, "user", "Registration cannot grant admin role");
  assert.equal("password" in registration.data.user, false, "Passwords are never returned");

  const customerLogin = await request(baseUrl, "/auth/login", {
    method: "POST",
    body: { email: customerEmail, password: customerPassword },
  });
  assert.equal(customerLogin.status, 200, "Customer login succeeds");
  const customerToken = customerLogin.data.token;
  const currentCustomer = await request(baseUrl, "/auth/me", { token: customerToken });
  assert.equal(currentCustomer.data.user.role, "user", "Current role comes from MongoDB");

  const anonymousAdminData = await request(baseUrl, "/orders");
  assert.equal(anonymousAdminData.status, 401, "Anonymous users cannot list orders");
  const customerAdminData = await request(baseUrl, "/orders", { token: customerToken });
  assert.equal(customerAdminData.status, 403, "Customers cannot list all orders");
  const customerContactData = await request(baseUrl, "/contact", { token: customerToken });
  assert.equal(customerContactData.status, 403, "Customers cannot read contact messages");
  const customerProductWrite = await request(baseUrl, "/products", {
    method: "POST",
    token: customerToken,
    body: { name: "Unauthorized", price: 1, category: "Sides" },
  });
  assert.equal(customerProductWrite.status, 403, "Customers cannot create products");

  const stalePriceOrder = await request(baseUrl, "/orders", {
    method: "POST",
    token: customerToken,
    body: {
      items: [{ product: product._id, name: "Forged item", price: 1, quantity: 2, image: "" }],
      customerName: "Smoke Recipient",
      phone: "+1 555 123 4567",
      address: "Temporary isolated smoke-test address",
      subtotal: 2,
      deliveryFee: 0,
      total: 2,
    },
  });
  assert.equal(stalePriceOrder.status, 409, "Checkout requires refresh when a menu price changes");

  const submittedOrder = await request(baseUrl, "/orders", {
    method: "POST",
    token: customerToken,
    body: {
      items: [{ product: product._id, name: "Forged item", price: product.price, quantity: 2, image: "" }],
      customerName: "Smoke Recipient",
      phone: "+1 555 123 4567",
      address: "Temporary isolated smoke-test address",
      subtotal: 2,
      deliveryFee: 0,
      total: 2,
    },
  });
  assert.equal(submittedOrder.status, 201, "Valid order persists");
  assert.equal(submittedOrder.data.order.items[0].price, product.price, "Order uses the MongoDB product price");
  assert.equal(submittedOrder.data.order.items[0].name, product.name, "Order uses the MongoDB product name");
  assert.equal(submittedOrder.data.order.subtotal, product.price * 2, "Subtotal is recalculated server-side");
  assert.equal(submittedOrder.data.order.deliveryFee, 150, "Delivery fee is server-controlled");
  assert.equal(submittedOrder.data.order.total, product.price * 2 + 150, "Total is recalculated server-side");
  const persistedOrder = await Order.findById(submittedOrder.data.order._id);
  assert.ok(persistedOrder, "Order is present in MongoDB");
  const customerHistory = await request(baseUrl, "/orders/my-orders", { token: customerToken });
  assert.equal(customerHistory.status, 200, "Customer can view order history");
  assert.equal(customerHistory.data.length, 1, "Customer history contains the persisted order");

  const secondEmail = `second-customer-${runId}@example.invalid`;
  const secondPassword = crypto.randomBytes(24).toString("base64url");
  await request(baseUrl, "/auth/register", {
    method: "POST",
    body: { name: "Second Customer", email: secondEmail, password: secondPassword },
  });
  const secondLogin = await request(baseUrl, "/auth/login", {
    method: "POST",
    body: { email: secondEmail, password: secondPassword },
  });
  assert.equal(secondLogin.status, 200, "Second customer can log in");
  const privateOrder = await request(baseUrl, `/orders/${persistedOrder._id}`, { token: secondLogin.data.token });
  assert.equal(privateOrder.status, 403, "Customers cannot view another customer's order");

  const customerStatusChange = await request(baseUrl, `/orders/${persistedOrder._id}/status`, {
    method: "PUT",
    token: customerToken,
    body: { status: "Delivered" },
  });
  assert.equal(customerStatusChange.status, 403, "Customers cannot change order status");

  const contact = await request(baseUrl, "/contact", {
    method: "POST",
    body: { name: "Smoke Customer", email: customerEmail, message: "Temporary isolated contact test" },
  });
  assert.equal(contact.status, 201, "Contact submission succeeds");
  assert.ok(await ContactMessage.findById(contact.data.contactMessage._id), "Contact message is present in MongoDB");

  const adminLogin = await request(baseUrl, "/auth/login", {
    method: "POST",
    body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
  });
  assert.equal(adminLogin.status, 200, "Configured admin can log in");
  const adminToken = adminLogin.data.token;
  assert.equal((await request(baseUrl, "/auth/me", { token: adminToken })).data.user.role, "admin");

  const adminOrders = await request(baseUrl, "/orders", { token: adminToken });
  assert.equal(adminOrders.status, 200, "Admin can list orders");
  assert.equal(adminOrders.data[0].user.email, customerEmail, "Admin order data includes customer account details");
  const updatedStatus = await request(baseUrl, `/orders/${persistedOrder._id}/status`, {
    method: "PUT",
    token: adminToken,
    body: { status: "Preparing" },
  });
  assert.equal(updatedStatus.status, 200, "Admin can update order status");
  assert.equal((await Order.findById(persistedOrder._id)).status, "Preparing", "Order status persists in MongoDB");

  const adminMessages = await request(baseUrl, "/contact", { token: adminToken });
  assert.equal(adminMessages.status, 200, "Admin can read submitted contact messages");
  assert.ok(adminMessages.data.some((message) => message._id === contact.data.contactMessage._id));

  const createdProduct = await request(baseUrl, "/products", {
    method: "POST",
    token: adminToken,
    body: { name: "Smoke Product", description: "Temporary", price: 321, category: "Sides", image: "" },
  });
  assert.equal(createdProduct.status, 201, "Admin can create products");
  const editedProduct = await request(baseUrl, `/products/${createdProduct.data.product._id}`, {
    method: "PUT",
    token: adminToken,
    body: { name: "Smoke Product Updated", role: "admin" },
  });
  assert.equal(editedProduct.status, 200, "Admin can update products");
  assert.equal(editedProduct.data.product.name, "Smoke Product Updated");
  assert.equal("role" in editedProduct.data.product, false, "Product updates ignore unapproved fields");

  const form = new FormData();
  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
  form.append("image", new Blob([png], { type: "image/png" }), "smoke.png");
  const uploadResponse = await fetch(`${baseUrl}/uploads/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: form,
  });
  assert.equal(uploadResponse.status, 201, "Admin image upload succeeds");
  const uploadedImage = await uploadResponse.json();
  uploadedFilename = path.basename(new URL(uploadedImage.image).pathname);
  const uploadedAsset = await fetch(uploadedImage.image);
  assert.equal(uploadedAsset.status, 200, "Uploaded image is served successfully");
  assert.match(uploadedAsset.headers.get("content-type"), /image\/png/);
  const imageUpdatedProduct = await request(baseUrl, `/products/${createdProduct.data.product._id}`, {
    method: "PUT",
    token: adminToken,
    body: { image: uploadedImage.image },
  });
  assert.equal(imageUpdatedProduct.data.product.image, uploadedImage.image, "Admin can save an uploaded image to a product");
  assert.equal((await request(baseUrl, `/products/${createdProduct.data.product._id}`, { method: "DELETE", token: adminToken })).status, 200, "Admin can delete products");

  const invalidForm = new FormData();
  invalidForm.append("image", new Blob(["<svg></svg>"], { type: "image/png" }), "invalid.png");
  const invalidUpload = await fetch(`${baseUrl}/uploads/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: invalidForm,
  });
  assert.equal(invalidUpload.status, 400, "Image upload rejects mismatched file signatures");

  process.env.NODE_ENV = "production";
  const productionLocalUpload = new FormData();
  productionLocalUpload.append("image", new Blob([png], { type: "image/png" }), "production.png");
  const refusedEphemeralUpload = await fetch(`${baseUrl}/uploads/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${adminToken}` },
    body: productionLocalUpload,
  });
  process.env.NODE_ENV = "test";
  assert.equal(refusedEphemeralUpload.status, 503, "Production refuses uploads to ephemeral local storage");

  const deniedUpload = await fetch(`${baseUrl}/uploads/image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${customerToken}` },
    body: new FormData(),
  });
  assert.equal(deniedUpload.status, 403, "Customers cannot upload images");

  await User.findByIdAndUpdate(adminLogin.data.user.id, { role: "user" });
  assert.equal((await request(baseUrl, "/orders", { token: adminToken })).status, 403, "Revoked admin role takes effect immediately");

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const failedLogin = await request(baseUrl, "/auth/login", {
      method: "POST",
      body: { email: `missing-${runId}@example.invalid`, password: "invalid-password" },
    });
    assert.equal(failedLogin.status, attempt === 5 ? 429 : 401, "Authentication attempts are rate limited");
  }

  console.log("Production smoke checks passed: auth, role boundaries, MongoDB orders/contact, pricing, CRUD, status updates, and image upload.");
};

run()
  .catch((error) => {
    console.error("Production smoke checks failed.", error.name);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (uploadedFilename) {
      await fs.unlink(path.join(__dirname, "..", "uploads", uploadedFilename)).catch(() => {});
    }
    if (mongoose.connection.readyState === 1) {
      try {
        await Promise.all([
          User.deleteMany({}),
          Order.deleteMany({}),
          ContactMessage.deleteMany({}),
          Product.deleteMany({}),
        ]);
        console.log("Temporary smoke records and upload were cleaned up.");
      } catch {
        console.error("Smoke cleanup failed; remove the isolated smoke-test records before deployment.");
        process.exitCode = 1;
      } finally {
        await mongoose.disconnect();
      }
    }
  });
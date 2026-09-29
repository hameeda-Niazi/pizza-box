const assert = require("node:assert/strict");
const crypto = require("node:crypto");

process.env.MONGO_URI = "mongodb://smoke.invalid/pizzabox";
process.env.JWT_SECRET = crypto.randomBytes(48).toString("base64url");
process.env.NODE_ENV = "production";
process.env.CLIENT_URL = "https://store.example.com";
process.env.ADMIN_EMAIL = "admin@example.com";
process.env.ADMIN_PASSWORD = crypto.randomBytes(24).toString("base64url");
process.env.CLOUDINARY_CLOUD_NAME = "smoke-cloud";
process.env.CLOUDINARY_API_KEY = "smoke-key";
process.env.CLOUDINARY_API_SECRET = "smoke-secret";
process.env.REDIS_URL = "";

const { app, validateProductionConfiguration } = require("../app");
const { updateValue, isValidEmail } = require("./rotateAppSecrets");
let phase = "initial production configuration";

const run = async () => {
  assert.doesNotThrow(validateProductionConfiguration);
  phase = "secret helper replaces a value";
  assert.equal(updateValue("JWT_SECRET=old\nKEEP=yes\n", "JWT_SECRET", "new"), "JWT_SECRET=new\nKEEP=yes\n");
  phase = "secret helper appends a value";
  assert.equal(updateValue("KEEP=yes\n", "JWT_SECRET", "new"), "KEEP=yes\nJWT_SECRET=new\n");
  phase = "secret helper validates email";
  assert.equal(isValidEmail("admin@example.com"), true);
  assert.equal(isValidEmail("bad address@example.com"), false);

  phase = "missing storage guard";
  process.env.CLOUDINARY_API_SECRET = "";
  assert.throws(validateProductionConfiguration, /persistent HTTPS upload storage/);
  process.env.CLOUDINARY_API_SECRET = "smoke-secret";
  phase = "HTTP production origin guard";
  process.env.CLIENT_URL = "http://localhost:5173";
  assert.throws(validateProductionConfiguration, /HTTPS origins/);
  phase = "CORS and security headers";
  process.env.CLIENT_URL = "https://store.example.com";

  const server = app.listen(0);
  try {
    await new Promise((resolve) => server.once("listening", resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const response = await fetch(`${baseUrl}/`, { headers: { Origin: "https://store.example.com" } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cross-origin-resource-policy"), "cross-origin");
    assert.ok(response.headers.get("x-content-type-options"));
    assert.equal(response.headers.get("access-control-allow-origin"), "https://store.example.com");

    const blocked = await fetch(`${baseUrl}/`, { headers: { Origin: "https://unlisted.example.com" } });
    assert.equal(blocked.headers.get("access-control-allow-origin"), null);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log("Database-free production config checks passed: HTTPS guard, CORS allowlist, security headers, and secret helper.");
};

run().catch(() => {
  console.error(`Database-free production config checks failed during ${phase}.`);
  process.exitCode = 1;
});
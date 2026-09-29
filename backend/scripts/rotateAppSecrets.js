const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, "..", ".env");

const updateValue = (source, key, value) => {
  const normalized = source.replace(/[\r\n]+$/, "");
  const lines = normalized ? normalized.split(/\r?\n/) : [];
  const index = lines.findIndex((line) => line.trimStart().startsWith(`${key}=`));
  if (index < 0) lines.push(`${key}=${value}`);
  else lines[index] = `${key}=${value}`;
  return `${lines.join("\n")}\n`;
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const rotateAppSecrets = () => {
  if (!fs.existsSync(envPath)) {
    throw new Error("Create backend/.env from .env.example first");
  }

  let contents = fs.readFileSync(envPath, "utf8");
  const values = dotenv.parse(contents);
  contents = updateValue(contents, "JWT_SECRET", crypto.randomBytes(48).toString("base64url"));

  if (values.ADMIN_EMAIL) {
    const email = values.ADMIN_EMAIL.trim().toLowerCase();
    if (!isValidEmail(email)) {
      throw new Error("Set a valid ADMIN_EMAIL in backend/.env before rotating admin credentials");
    }
    contents = updateValue(contents, "ADMIN_EMAIL", email);
    contents = updateValue(contents, "ADMIN_PASSWORD", crypto.randomBytes(32).toString("base64url"));
  }

  fs.writeFileSync(envPath, contents, { mode: 0o600 });
  console.log(values.ADMIN_EMAIL
    ? "Application and administrator secrets were rotated in the private environment file. Values were not displayed."
    : "JWT secret was rotated in the private environment file. Set ADMIN_EMAIL there and rerun to generate an administrator password. Values were not displayed.");
};

const clearCompromisedMongoUri = () => {
  if (!fs.existsSync(envPath)) throw new Error("Private backend environment file is missing");
  const contents = fs.readFileSync(envPath, "utf8");
  fs.writeFileSync(envPath, updateValue(contents, "MONGO_URI", ""), { mode: 0o600 });
  console.log("The previous MongoDB URI was removed from the private local environment. Add a rotated URI before starting the backend.");
};

if (require.main === module) {
  try {
    if (process.argv.includes("--clear-compromised-mongo-uri")) clearCompromisedMongoUri();
    else rotateAppSecrets();
  } catch {
    console.error("Unable to rotate application secrets; verify the private environment file and retry.");
    process.exitCode = 1;
  }
}

module.exports = { updateValue, isValidEmail };
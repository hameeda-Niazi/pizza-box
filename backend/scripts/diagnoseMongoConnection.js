const path = require("node:path");
const dns = require("node:dns/promises");
const mongoose = require("mongoose");
const envPath = path.join(__dirname, "..", ".env");
require("dotenv").config({ path: envPath, quiet: true });

const redact = (message) => String(message || "")
  .replace(/mongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, "[REDACTED MONGO_URI]")
  .replace(/(password|passwd|pwd)(\s*[=:]\s*)[^\s,;]+/gi, "$1$2[REDACTED]");

const parseMongoUri = (uri) => {
  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^/?#]*)(.*)$/i);
  if (!match) return null;

  const [, scheme, authority, suffix] = match;
  const atIndex = authority.lastIndexOf("@");
  const credentials = atIndex >= 0 ? authority.slice(0, atIndex) : "";
  const hosts = (atIndex >= 0 ? authority.slice(atIndex + 1) : authority)
    .split(",")
    .filter(Boolean);
  if (hosts.length === 0) return null;

  const queryIndex = suffix.indexOf("?");
  const pathname = queryIndex >= 0 ? suffix.slice(0, queryIndex) : suffix;
  const query = new URLSearchParams(queryIndex >= 0 ? suffix.slice(queryIndex + 1) : "");
  const encodedUsername = credentials.split(":", 1)[0];
  let username = "";
  try {
    username = decodeURIComponent(encodedUsername);
  } catch {
    return null;
  }

  let databaseName = "";
  try {
    databaseName = decodeURIComponent(pathname.replace(/^\/+/, ""));
  } catch {
    return null;
  }

  return {
    isSrv: scheme.toLowerCase().startsWith("mongodb+srv:"),
    hostCount: hosts.length,
    isAtlasHost: hosts.every((host) => host.split(":")[0].toLowerCase().endsWith(".mongodb.net")),
    credentialsPresent: Boolean(credentials.includes(":")),
    usernameMatchesAtlasUser: username === "pizzabox_Admin",
    databaseName,
    authSource: query.get("authSource"),
    tlsConfigured: query.get("tls") === "true" || query.get("ssl") === "true",
    srvHostname: hosts[0].split(":")[0],
  };
};

async function diagnose() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log(JSON.stringify({ envPath, mongoUriPresent: false }));
    process.exitCode = 2;
    return;
  }

  const parsed = parseMongoUri(uri);
  if (!parsed) {
    console.log(JSON.stringify({ envPath, mongoUriPresent: true, parseError: "Unsupported or malformed MongoDB URI; value suppressed." }));
    process.exitCode = 2;
    return;
  }

  console.log(JSON.stringify({
    envPath,
    mongoUriPresent: true,
    scheme: parsed.isSrv ? "mongodb+srv" : "mongodb",
    atlasHostname: parsed.isAtlasHost,
    hostCount: parsed.hostCount,
    credentialsPresent: parsed.credentialsPresent,
    usernameMatchesAtlasUser: parsed.usernameMatchesAtlasUser,
    databaseName: process.env.MONGO_DB_NAME || parsed.databaseName || null,
    authSource: parsed.authSource,
    tlsConfigured: parsed.tlsConfigured,
  }));

  if (parsed.isSrv) {
    try {
      const records = await dns.resolveSrv(`_mongodb._tcp.${parsed.srvHostname}`);
      console.log(JSON.stringify({ dnsSrv: "ok", recordCount: records.length }));
    } catch (error) {
      console.log(JSON.stringify({ dnsSrv: "failed", name: error.name, code: error.code || null, message: redact(error.message) }));
    }
  }

  try {
    const options = { serverSelectionTimeoutMS: 12000 };
    if (process.env.MONGO_DB_NAME) options.dbName = process.env.MONGO_DB_NAME;
    await mongoose.connect(uri, options);
    console.log(JSON.stringify({ connection: "connected" }));
  } catch (error) {
    console.log(JSON.stringify({
      connection: "failed",
      name: error.name || null,
      code: error.code || null,
      codeName: error.codeName || null,
      message: redact(error.message),
    }));
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

diagnose().catch((error) => {
  console.log(JSON.stringify({ diagnostic: "failed", name: error.name || null, code: error.code || null, message: "Unexpected diagnostic error; details withheld." }));
  process.exitCode = 1;
});

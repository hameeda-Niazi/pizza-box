# Pizza Box Backend

## Local setup

Install dependencies with `npm install`. Copy `.env.example` to `.env` and fill in the private values. Keep `.env` out of source control; never put database credentials or signing keys in frontend variables.

Required settings:

- `MONGO_URI`: MongoDB connection string for the application database.
- `JWT_SECRET`: a private random value of at least 32 bytes.
- `CLIENT_URL`: the exact frontend origin(s) allowed to call the API; separate multiple origins with commas.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: a dedicated administrator account; use a unique password of 12-72 bytes.

Optional settings include `ADMIN_NAME`, `PORT`, `PUBLIC_API_URL` (the public HTTPS API origin used for local persistent uploads), `UPLOADS_DIR` (a persistent mounted directory), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` for durable object storage, `REDIS_URL` for a shared rate-limit store, and `TRUST_PROXY_HOPS` for the exact number of trusted reverse proxies in front of the API.

Run locally with `npm run dev`; start the production server with `npm start`. To create or reset the configured administrator, set the values in the ignored `.env` file and run `npm run create-admin`. The command does not accept or print credentials on the command line.

To replace the JWT signing key and generate a random administrator password after `ADMIN_EMAIL` is set, run `npm run rotate-app-secrets`. It updates the ignored environment file and never displays generated values. Rotating the JWT key invalidates previously issued sessions.

The administrator routes are intentionally not linked from the public site. Open `/admin/login` directly; successful sign-in is checked against the API before the dashboard renders. Admin APIs independently require a valid administrator role.

## Production checklist

- Use HTTPS for the frontend and API, a production MongoDB user restricted to the application database, and a unique strong `JWT_SECRET`.
- After rotating an exposed MongoDB password in MongoDB Atlas, replace the private `MONGO_URI` with the new connection string, verify connectivity, and revoke the old database credential. Never paste the URI into chat or commit it.
- Set `NODE_ENV=production` so the API only accepts explicitly configured CORS origins.
- Set `CLIENT_URL` to the deployed frontend origin and `PUBLIC_API_URL` to the deployed API origin.
- Set `TRUST_PROXY_HOPS` to the number of trusted load balancer/reverse-proxy hops; leave it at `0` when the API is directly exposed.
- Configure Cloudinary credentials for durable object storage, or mount `UPLOADS_DIR` on a persistent volume and set `PUBLIC_API_URL` to the HTTPS API origin. Production uploads refuse the default ephemeral local directory.
- Set `REDIS_URL` to a private Redis service to share rate limits across backend instances. Without it, rate limits are per-process and appropriate only for a single instance.
- Keep `.env`, uploads, logs, and backups private. Rotate any credentials that were ever committed, pasted into chat, or used as demo credentials.
- `npm run build` in `frontend` and `npm start` in `backend` are the release commands. Contact and order mutations require a reachable MongoDB instance.
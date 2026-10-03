# Pizza Box Frontend

## Local development

Install dependencies with `npm install`, then run `npm run dev`. During development, the API defaults to `http://localhost:5000/api`; override it with `VITE_API_URL` in a private local `.env` file when needed. Production builds use the same-origin `/api` path unless `VITE_API_URL` is set.

Run `npm run lint` and `npm run build` before deployment. For a separately hosted backend, set `VITE_API_URL` to its public API URL (for example, `https://api.example.com/api`) in the frontend build environment and rebuild; for a same-origin reverse proxy, route `/api` to the backend. Deploy the generated `dist` directory to a static host and configure the backend `CLIENT_URL` with the exact deployed origin. Frontend environment variables are bundled into public code, so never put credentials or private keys in them.

Administrator sign-in is intentionally unlinked from public navigation. Open `/admin/login` directly; the dashboard verifies administrator role with the API.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

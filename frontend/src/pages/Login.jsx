import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = ({ isAdminLogin = false }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");

    try {
      setLoading(true);

      const response = await api.post("/auth/login", form);

      if (isAdminLogin && response.data.user.role !== "admin") {
        setStatus("This account does not have administrator access.");
        return;
      }

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      window.dispatchEvent(new Event("auth-changed"));

      navigate(isAdminLogin ? "/admin" : "/menu");
    } catch (error) {
      setStatus(
        error.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-[75vh] items-center justify-center px-5 py-14">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="text-5xl">🍕</div>

          <h1 className="mt-4 text-3xl font-black">
            {isAdminLogin ? "Admin Login" : "Welcome Back"}
          </h1>

          <p className="mt-2 text-gray-500">
            {isAdminLogin
              ? "Sign in with your Pizza Box administrator account."
              : "Login to your Pizza Box account."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          {status && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{status}</p>}
          <label className="mb-2 block font-semibold">
            Email
          </label>

          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
            placeholder="you@example.com"
          />

          <label className="mb-2 mt-5 block font-semibold">
            Password
          </label>

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            maxLength={72}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
            placeholder="••••••••"
          />

          <button
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-orange-600 px-5 py-3.5 font-bold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : isAdminLogin ? "Admin Login" : "Login"}
          </button>
        </form>

        {!isAdminLogin && <p className="mt-6 text-center text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-orange-600 hover:text-orange-700"
          >
            Register
          </Link>
        </p>}
      </div>
    </section>
  );
};

export default Login;

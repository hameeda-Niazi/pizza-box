import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    try {
      setLoading(true);

      await api.post("/auth/register", form);
      setForm({ name: "", email: "", password: "" });
      setStatus({ type: "success", message: "Account created. You can now log in." });
    } catch (error) {
      setStatus({
        type: "error",
        message:
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      });
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
            Create Account
          </h1>

          <p className="mt-2 text-gray-500">
            Join Pizza Box today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          {status.message && <p role={status.type === "error" ? "alert" : "status"} className={`mb-5 rounded-xl p-3 text-sm font-semibold ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{status.message}</p>}
          <label className="mb-2 block font-semibold">
            Full Name
          </label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
            placeholder="Your name"
          />

          <label className="mb-2 mt-5 block font-semibold">
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
            minLength={12}
            maxLength={72}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
            placeholder="At least 12 characters"
          />

          <button
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-orange-600 px-5 py-3.5 font-bold text-white hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-orange-600 hover:text-orange-700"
          >
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
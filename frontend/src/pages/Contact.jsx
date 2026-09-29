import { useState } from "react";
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import api from "../services/api";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      const response = await api.post("/contact", form);
      setStatus({ type: "success", message: response.data.message });
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus({ type: "error", message: error.response?.data?.message || "Unable to send your message. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-14">
      <div className="text-center">
        <span className="font-bold text-orange-600">CONTACT US</span>

        <h1 className="mt-2 text-4xl font-black">
          We Would Love To Hear From You
        </h1>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="rounded-3xl bg-orange-600 p-8 text-white">
          <h2 className="text-3xl font-black">Get In Touch</h2>

          <p className="mt-4 leading-7 text-orange-100">
            Have a question, suggestion or feedback? Send us a message.
          </p>

          <div className="mt-10 space-y-6">
            <div className="flex gap-4">
              <FiMapPin size={25} />
              <div>
                <h3 className="font-bold">Address</h3>
                <p className="mt-1 text-orange-100">
                  Peshawar, Pakistan
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <FiPhone size={25} />
              <div>
                <h3 className="font-bold">Phone</h3>
                <p className="mt-1 text-orange-100">
                  +92 XXX XXXXXXX
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <FiMail size={25} />
              <div>
                <h3 className="font-bold">Email</h3>
                <p className="mt-1 text-orange-100">
                  hello@pizzabox.com
                </p>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-8 shadow-sm"
        >
          {status.message && (
            <p className={`mb-5 rounded-xl p-3 text-sm font-semibold ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {status.message}
            </p>
          )}
          <div>
            <label className="mb-2 block font-semibold">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Your name"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block font-semibold">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block font-semibold">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows="5"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Write your message..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-orange-600 px-5 py-3.5 font-bold text-white hover:bg-orange-700"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;

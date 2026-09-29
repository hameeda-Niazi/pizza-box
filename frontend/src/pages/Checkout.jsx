import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Checkout = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryFee = cart.length > 0 ? 150 : 0;
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setStatus("");

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before placing an order.");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      navigate("/menu");
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        items: cart.map((item) => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || "",
        })),
        customerName: form.customerName,
        phone: form.phone,
        address: form.address,
        paymentMethod: "Cash on Delivery",
        subtotal,
        deliveryFee,
        total,
      };

      await api.post("/orders", orderData);

      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cart-updated"));

      navigate("/orders", { state: { notice: "Order placed successfully." } });
    } catch (error) {
      if (error.response?.status === 409) {
        try {
          const { data: latestProducts } = await api.get("/products");
          const productsById = new Map(latestProducts.map((product) => [product._id, product]));
          const refreshedCart = cart.map((item) => {
            const product = productsById.get(item._id);
            return product ? { ...product, quantity: item.quantity } : item;
          });
          setCart(refreshedCart);
          localStorage.setItem("cart", JSON.stringify(refreshedCart));
          window.dispatchEvent(new Event("cart-updated"));
          setStatus("A menu price changed. The latest prices are shown above; review and place your order again.");
          return;
        } catch {
          // Show the original checkout error if the menu refresh is unavailable.
        }
      }
      setStatus(
        error.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="text-4xl font-black">Checkout</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_350px]">
        <form
          onSubmit={placeOrder}
          className="rounded-2xl bg-white p-7 shadow-sm"
        >
          {status && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{status}</p>}
          <h2 className="text-2xl font-black">Delivery Information</h2>

          <div className="mt-6">
            <label className="mb-2 block font-semibold">
              Full Name
            </label>

            <input
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Enter your name"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block font-semibold">
              Phone Number
            </label>

            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              pattern="[+0-9][0-9 ()-]{6,19}"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="03XX XXXXXXX"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block font-semibold">
              Delivery Address
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              rows="4"
              maxLength={500}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500"
              placeholder="Enter complete delivery address"
            />
          </div>

          <div className="mt-5 rounded-xl bg-orange-50 p-4">
            <p className="font-semibold">Payment Method</p>
            <p className="mt-1 text-gray-600">
              Cash on Delivery
            </p>
          </div>

          <button
            disabled={loading}
            className="mt-7 w-full rounded-xl bg-orange-600 px-5 py-3.5 font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Order Summary</h2>

          <div className="mt-6 space-y-3">
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex justify-between gap-4 text-sm"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>

                <span className="font-semibold">
                  PKR {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3 border-t pt-5">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>PKR {deliveryFee.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-lg font-black">
              <span>Total</span>
              <span className="text-orange-600">
                PKR {total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Checkout;

import { useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2, FiMinus, FiPlus } from "react-icons/fi";

const Cart = () => {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));
  };

  const increase = (id) => {
    const updated = cart.map((item) =>
      item._id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    updateCart(updated);
  };

  const decrease = (id) => {
    const updated = cart
      .map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(updated);
  };

  const remove = (id) => {
    updateCart(cart.filter((item) => item._id !== id));
  };

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const delivery = cart.length > 0 ? 150 : 0;
  const total = subtotal + delivery;

  if (cart.length === 0) {
    return (
      <section className="mx-auto max-w-4xl px-5 py-24 text-center">
        <div className="text-7xl">🛒</div>

        <h1 className="mt-6 text-3xl font-black">
          Your cart is empty
        </h1>

        <p className="mt-3 text-gray-500">
          Add something delicious from our menu.
        </p>

        <Link
          to="/menu"
          className="mt-7 inline-block rounded-xl bg-orange-600 px-7 py-3 font-bold text-white hover:bg-orange-700"
        >
          Browse Menu
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <h1 className="text-4xl font-black">Your Cart</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={item._id}
              className="flex flex-wrap items-center gap-5 rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-orange-100 text-4xl">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : (
                  "🍕"
                )}
              </div>

              <div className="flex-1">
                <h2 className="font-bold">{item.name}</h2>

                <p className="mt-1 font-semibold text-orange-600">
                  PKR {item.price.toLocaleString()}
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <button
                    onClick={() => decrease(item._id)}
                    className="rounded-lg bg-gray-100 p-2"
                  >
                    <FiMinus />
                  </button>

                  <span className="font-bold">{item.quantity}</span>

                  <button
                    onClick={() => increase(item._id)}
                    className="rounded-lg bg-gray-100 p-2"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              <button
                onClick={() => remove(item._id)}
                className="rounded-lg p-3 text-red-500 hover:bg-red-50"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Order Summary</h2>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>PKR {delivery.toLocaleString()}</span>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-black">
                <span>Total</span>
                <span className="text-orange-600">PKR {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block rounded-xl bg-orange-600 px-5 py-3 text-center font-bold text-white hover:bg-orange-700"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Cart;

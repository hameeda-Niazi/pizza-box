import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const Orders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    api
      .get("/orders/my-orders")
      .then((response) => setOrders(response.data))
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.dispatchEvent(new Event("auth-changed"));
          navigate("/login");
          return;
        }
        setError(requestError.response?.data?.message || "We could not load your orders.");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return <section className="mx-auto max-w-6xl px-5 py-20 text-center text-gray-500">Loading your orders...</section>;
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="font-bold text-orange-600">ORDER HISTORY</span>
          <h1 className="mt-2 text-4xl font-black">My Orders</h1>
        </div>
        <Link to="/menu" className="rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-700">Order Again</Link>
      </div>

      {error && <p className="mt-8 rounded-xl bg-red-50 p-4 font-medium text-red-700">{error}</p>}
      {location.state?.notice && <p role="status" className="mt-8 rounded-xl bg-green-50 p-4 font-medium text-green-700">{location.state.notice}</p>}

      {!error && orders.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-black">No orders yet</h2>
          <p className="mt-2 text-gray-500">Your completed orders will appear here.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {orders.map((order) => (
            <article key={order._id} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <p className="font-black">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="mt-1 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-PK", { dateStyle: "medium" })}</p>
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700">{order.status}</span>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                {order.items.map((item) => <div key={`${order._id}-${item.product}`} className="flex justify-between gap-4"><span>{item.name} × {item.quantity}</span><span>PKR {(item.price * item.quantity).toLocaleString()}</span></div>)}
              </div>
              <div className="mt-4 flex justify-between border-t border-gray-100 pt-4 font-black"><span>Total</span><span className="text-orange-600">PKR {order.total.toLocaleString()}</span></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Orders;

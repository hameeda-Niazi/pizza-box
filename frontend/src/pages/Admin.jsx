import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const categories = ["Pizzas", "Burgers", "Sides", "Wraps", "Drinks", "Desserts", "Deals"];
const statuses = ["Pending", "Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];
const blankProduct = { name: "", description: "", price: "", category: "Pizzas", image: "" };

const Admin = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(blankProduct);
  const [editingId, setEditingId] = useState("");
  const [notice, setNotice] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("token") || user?.role !== "admin") {
      navigate("/");
      return;
    }

    Promise.all([api.get("/orders"), api.get("/products")])
      .then(([ordersResponse, productsResponse]) => {
        setOrders(ordersResponse.data);
        setProducts(productsResponse.data);
      })
      .catch((error) => {
        setNotice(error.response?.data?.message || "Unable to load the dashboard.");
        if ([401, 403].includes(error.response?.status)) navigate("/");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const saveProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    const data = { ...form, price: Number(form.price) };
    try {
      const { data: response } = editingId
        ? await api.put(`/products/${editingId}`, data)
        : await api.post("/products", data);
      setProducts((current) => editingId
        ? current.map((product) => product._id === editingId ? response.product : product)
        : [response.product, ...current]);
      setNotice(editingId ? "Product updated successfully." : "Product added to the menu.");
      setEditingId("");
      setForm(blankProduct);
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("image", file);
    setUploading(true);
    api.post("/uploads/image", data, { headers: { "Content-Type": "multipart/form-data" } })
      .then((response) => {
        setForm((current) => ({ ...current, image: response.data.image }));
        setNotice("Image uploaded successfully.");
      })
      .catch((error) => setNotice(error.response?.data?.message || "Unable to upload image."))
      .finally(() => setUploading(false));
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setForm({ name: product.name, description: product.description, price: String(product.price), category: product.category, image: product.image || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = (id) => {
    if (!window.confirm("Remove this menu item?")) return;
    api.delete(`/products/${id}`)
      .then(() => {
        setProducts((current) => current.filter((product) => product._id !== id));
        setNotice("Product removed from the menu.");
      })
      .catch((error) => setNotice(error.response?.data?.message || "Unable to remove product."));
  };

  const updateStatus = async (id, status) => {
    setUpdatingStatusId(id);
    setNotice("");
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      setOrders((current) => current.map((order) => order._id === id ? data.order : order));
      setNotice("Order status updated.");
    } catch (error) {
      setNotice(error.response?.data?.message || "Unable to update order status.");
    } finally {
      setUpdatingStatusId("");
    }
  };

  if (loading) return <section className="px-5 py-20 text-center text-gray-500">Loading dashboard...</section>;

  return (
    <section className="mx-auto max-w-7xl px-5 py-14">
      <span className="font-bold text-orange-600">ADMIN DASHBOARD</span>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="mt-2 text-4xl font-black">Manage Pizza Box</h1>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth-changed"));
            navigate("/", { replace: true });
          }}
          className="rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Logout
        </button>
      </div>
      {notice && <p className="mt-6 rounded-xl bg-orange-50 p-4 font-medium text-orange-800">{notice}</p>}

      <div className="mt-10 grid gap-8 lg:grid-cols-[360px_1fr]">
        <form onSubmit={saveProduct} className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">{editingId ? "Edit menu item" : "Add menu item"}</h2>
          <label className="mt-4 block text-sm font-bold">Name<input required maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-500" /></label>
          <label className="mt-4 block text-sm font-bold">Price (PKR)<input required type="number" min="0" max="10000000" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-500" /></label>
          <label className="mt-4 block text-sm font-bold">Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-500">{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="mt-4 block text-sm font-bold">Image URL<input type="url" maxLength={2048} value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-500" /></label>
          <label className="mt-4 block text-sm font-bold">Or upload image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage} className="mt-2 block w-full text-sm" /></label>
          {form.image && <img src={form.image} alt="Product preview" className="mt-3 h-24 w-full rounded-xl object-cover" />}
          <label className="mt-4 block text-sm font-bold">Description<textarea required maxLength={2000} rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 outline-none focus:border-orange-500" /></label>
          <button disabled={uploading || saving} className="mt-5 w-full rounded-xl bg-orange-600 px-4 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-60">{uploading ? "Uploading..." : saving ? "Saving..." : editingId ? "Save changes" : "Add Product"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(""); setForm(blankProduct); }} className="mt-3 w-full rounded-xl border border-gray-200 px-4 py-3 font-bold text-gray-700">Cancel edit</button>}
        </form>

        <div className="space-y-8">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Products ({products.length})</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {products.map((product) => <article key={product._id} className="rounded-xl border border-orange-100 p-4"><div className="flex gap-3">{product.image && <img src={product.image} alt="" className="h-14 w-14 rounded-lg object-cover" />}<div><p className="font-bold">{product.name}</p><p className="mt-1 text-sm text-gray-500">{product.category}</p><p className="mt-2 font-bold text-orange-600">PKR {Number(product.price).toLocaleString()}</p></div></div><div className="mt-4 flex gap-2"><button onClick={() => editProduct(product)} className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700">Edit</button><button onClick={() => deleteProduct(product._id)} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-bold text-red-700">Delete</button></div></article>)}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Orders ({orders.length})</h2>
            <div className="mt-4 space-y-3">
              {orders.map((order) => <article key={order._id} className="rounded-xl border border-gray-100 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold">#{order._id.slice(-6).toUpperCase()} · {order.customerName}</p><p className="mt-1 text-sm text-gray-500">{new Date(order.createdAt).toLocaleString("en-PK")} · PKR {Number(order.total).toLocaleString()}</p></div><select disabled={updatingStatusId === order._id} value={order.status} onChange={(event) => updateStatus(order._id, event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold outline-none focus:border-orange-500 disabled:opacity-60">{statuses.map((status) => <option key={status}>{status}</option>)}</select></div><div className="mt-3 grid gap-2 border-t border-gray-100 pt-3 text-sm text-gray-600 sm:grid-cols-2"><p><b>Account:</b> {order.user?.name || "Deleted account"} {order.user?.email && `(${order.user.email})`}</p><p><b>Phone:</b> {order.phone}</p><p className="sm:col-span-2"><b>Address:</b> {order.address}</p><p className="sm:col-span-2"><b>Items:</b> {order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}</p></div></article>)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Admin;

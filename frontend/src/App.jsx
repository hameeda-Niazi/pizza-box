import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import PrivateLayout from "./layouts/PrivateLayout";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Deals from "./pages/Deals";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import RequireAdmin from "./components/RequireAdmin";

const NotFound = () => (
  <section className="mx-auto max-w-2xl px-5 py-24 text-center">
    <p className="font-bold text-orange-600">404 · PAGE NOT FOUND</p>
    <h1 className="mt-3 text-4xl font-black">This page isn’t on the menu.</h1>
    <p className="mt-3 text-gray-600">The link may be outdated, or the address may be mistyped.</p>
    <Link to="/" className="mt-7 inline-block rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700">Back to home</Link>
  </section>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<PrivateLayout />}>
          <Route path="/admin/login" element={<Login isAdminLogin />} />
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

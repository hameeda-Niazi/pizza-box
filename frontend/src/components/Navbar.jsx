import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX, FiShoppingCart } from "react-icons/fi";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const syncNavigation = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
        setUser(JSON.parse(localStorage.getItem("user")) || null);
      } catch {
        setCartCount(0);
        setUser(null);
      }
    };

    syncNavigation();
    window.addEventListener("cart-updated", syncNavigation);
    window.addEventListener("auth-changed", syncNavigation);
    window.addEventListener("storage", syncNavigation);

    return () => {
      window.removeEventListener("cart-updated", syncNavigation);
      window.removeEventListener("auth-changed", syncNavigation);
      window.removeEventListener("storage", syncNavigation);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    setOpen(false);
  };

  const links = [
    { name: "Home", path: "/" },
    { name: "Menu", path: "/menu" },
    { name: "Deals", path: "/deals" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="text-2xl font-black text-orange-600">
          Pizza<span className="text-gray-900">Box</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `font-medium transition ${
                  isActive
                    ? "text-orange-600"
                    : "text-gray-700 hover:text-orange-600"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          {user && (
            <NavLink
              to="/orders"
              className={({ isActive }) => `font-medium transition ${isActive ? "text-orange-600" : "text-gray-700 hover:text-orange-600"}`}
            >
              Orders
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative rounded-full bg-orange-50 p-3 text-orange-600 transition hover:bg-orange-100"
          >
            <FiShoppingCart size={21} />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-xs font-bold text-white">
              {cartCount}
            </span>
          </Link>

          {user ? (
            <button
              onClick={logout}
              className="hidden rounded-full bg-gray-900 px-5 py-2.5 font-semibold text-white transition hover:bg-gray-800 sm:block"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-full bg-orange-600 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-700 sm:block"
            >
              Login
            </Link>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-gray-800 md:hidden"
          >
            {open ? <FiX size={25} /> : <FiMenu size={25} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-orange-100 bg-white px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setOpen(false)}
                className="font-medium text-gray-700 hover:text-orange-600"
              >
                {link.name}
              </NavLink>
            ))}

            {user && (
              <>
                <NavLink
                  to="/orders"
                  onClick={() => setOpen(false)}
                  className="font-medium text-gray-700 hover:text-orange-600"
                >
                  My Orders
                </NavLink>
              </>
            )}

            {user ? (
              <button
                onClick={logout}
                className="rounded-lg bg-gray-900 px-5 py-3 text-center font-semibold text-white"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-lg bg-orange-600 px-5 py-3 text-center font-semibold text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

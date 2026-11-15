import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/Products";
import api from "../services/api";

const curatedImages = new Map(products.map((product) => [product.name, product.image]));

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCategory = searchParams.get("category");
  const [menuProducts, setMenuProducts] = useState(products);
  const [menuReady, setMenuReady] = useState(false);
  const [menuError, setMenuError] = useState("");
  const [category, setCategory] = useState(requestedCategory || "All");
  const [search, setSearch] = useState("");
  const [cartNotice, setCartNotice] = useState("");
  const categories = ["All", "Pizzas", "Burgers", "Sides", "Wraps", "Drinks", "Desserts", "Deals"];

  useEffect(() => {
    let active = true;

    api
      .get("/products")
      .then((response) => {
        if (!Array.isArray(response.data)) {
          throw new Error("Menu response was not a product list");
        }

        const databaseProducts = response.data
          .filter((product) => product.isAvailable !== false)
          .map((product) => ({
            ...product,
            image: product.image || curatedImages.get(product.name) || "",
          }));

        if (active) {
          setMenuProducts(databaseProducts);
          setMenuReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setMenuError("The live menu is unavailable. You can browse sample items, but ordering is temporarily unavailable.");
          setMenuReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = menuProducts.filter((product) => {
    const matchesCategory =
      category === "All" || product.category === category;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    let existingCart;
    try {
      const savedCart = JSON.parse(localStorage.getItem("cart"));
      existingCart = Array.isArray(savedCart) ? savedCart : [];
    } catch {
      existingCart = [];
    }

    const existingItem = existingCart.find(
      (item) => item._id === product._id
    );

    if (existingItem?.quantity >= 99) {
      setCartNotice("You can add up to 99 of each item per order.");
      return;
    }

    let updatedCart;

    if (existingItem) {
      updatedCart = existingCart.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [
        ...existingCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    }

    try {
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      window.dispatchEvent(new Event("cart-updated"));
      setCartNotice(`${product.name} added to your cart.`);
    } catch {
      setCartNotice("Your cart could not be saved. Check your browser storage settings and try again.");
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-5 py-14">
      <div className="text-center">
        <span className="font-bold text-orange-600">OUR MENU</span>

        <h1 className="mt-2 text-4xl font-black text-gray-950">
          Delicious Food For Everyone
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-gray-500">
          Explore pizzas, burgers, sides, wraps, drinks, desserts and value deals.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-xl">
        <input
          aria-label="Search menu"
          type="text"
          placeholder="Search food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 outline-none focus:border-orange-500"
        />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={category === item}
            onClick={() => {
              setCategory(item);
              setSearchParams(item === "All" ? {} : { category: item }, { replace: true });
            }}
            className={`rounded-full px-5 py-2.5 font-semibold transition ${
              category === item
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-700 shadow-sm hover:bg-orange-50"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {menuError && <p role="alert" className="mx-auto mt-8 max-w-2xl rounded-xl bg-amber-50 p-4 text-center font-medium text-amber-800">{menuError}</p>}
      {cartNotice && <p role="status" className="mx-auto mt-5 max-w-2xl rounded-xl bg-green-50 p-3 text-center font-medium text-green-800">{cartNotice}</p>}
      {!menuReady && <p role="status" className="mt-8 text-center text-gray-500">Loading the current menu...</p>}

      {menuReady && filteredProducts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-semibold text-gray-700">
            {search ? `No menu items match “${search}”.` : "No items are available in this category right now."}
          </p>
          {search && <button type="button" onClick={() => setSearch("")} className="mt-3 font-bold text-orange-600 hover:text-orange-700">Clear search</button>}
        </div>
      ) : menuReady && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={addToCart}
              canOrder={menuReady && /^[a-f\d]{24}$/i.test(product._id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Menu;

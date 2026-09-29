import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { products } from "../data/Products";
import api from "../services/api";

const curatedImages = new Map(products.map((product) => [product.name, product.image]));

const Menu = () => {
  const [menuProducts, setMenuProducts] = useState(products);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const categories = ["All", "Pizzas", "Burgers", "Sides", "Wraps", "Drinks", "Desserts", "Deals"];

  useEffect(() => {
    api
      .get("/products")
      .then((response) => {
        const databaseProducts = Array.isArray(response.data)
          ? response.data
              .filter((product) => product.isAvailable !== false)
              .map((product) => ({
                ...product,
                image: curatedImages.get(product.name) || product.image,
              }))
          : [];

        if (databaseProducts.length >= products.length) {
          setMenuProducts(databaseProducts);
        } else if (databaseProducts.length > 0) {
          setMenuProducts((currentProducts) => [
            ...currentProducts,
            ...databaseProducts.filter(
              (product) => !currentProducts.some((item) => item.name === product.name)
            ),
          ]);
        }
      })
      .catch(() => {
        // The curated menu remains available if the API is temporarily offline.
      });
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
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

    const existingItem = existingCart.find(
      (item) => item._id === product._id
    );

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

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cart-updated"));

    alert(`${product.name} added to cart!`);
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
            onClick={() => setCategory(item)}
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

      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-semibold text-gray-700">
            No products found.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Menu;

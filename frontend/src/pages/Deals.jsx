import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { products } from "../data/Products";
import api from "../services/api";

const Deals = () => {
  const [deals, setDeals] = useState(() => products.filter((product) => product.category === "Deals"));
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api.get("/products")
      .then(({ data }) => {
        if (!Array.isArray(data)) throw new Error("Menu response was not a product list");
        if (active) setDeals(data.filter((product) => product.category === "Deals" && product.isAvailable !== false));
      })
      .catch(() => {
        if (active) setError("Live deals could not be refreshed. Prices may not be current; check the menu before ordering.");
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-5 py-14">
      <div className="text-center">
        <span className="font-bold text-orange-600">SPECIAL OFFERS</span>

        <h1 className="mt-2 text-4xl font-black">
          Deals Made For You
        </h1>

        <p className="mt-4 text-gray-500">
          More food, more fun, more savings.
        </p>
      </div>

      {error && <p role="alert" className="mx-auto mt-8 max-w-2xl rounded-xl bg-amber-50 p-4 text-center font-medium text-amber-800">{error}</p>}

      {deals.length === 0 ? (
        <p className="mt-12 text-center text-gray-500">No deals are available right now.</p>
      ) : <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => (
          <div
            key={deal.name}
            className="overflow-hidden rounded-3xl bg-white shadow-lg"
          >
            <div className="h-48 overflow-hidden bg-orange-50">
              <img
                src={deal.image}
                alt={`${deal.name} food selection`}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-6">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-600">
                SPECIAL DEAL
              </span>

              <h2 className="mt-4 text-2xl font-black">{deal.name}</h2>

              <p className="mt-2 text-gray-500">{deal.description}</p>

              <div className="mt-5 flex items-center gap-3">
                <span className="text-2xl font-black text-orange-600">
                  PKR {Number(deal.price).toLocaleString()}
                </span>
              </div>

              <Link
                to="/menu?category=Deals"
                className="mt-6 block rounded-xl bg-orange-600 px-5 py-3 text-center font-bold text-white hover:bg-orange-700"
              >
                Order Deal
              </Link>
            </div>
          </div>
        ))}
      </div>}
    </section>
  );
};

export default Deals;

import { Link } from "react-router-dom";
import { products } from "../data/Products";

const dealImages = new Map(
  products.filter((product) => product.category === "Deals").map((product) => [product._id, product.image])
);

const deals = [
  {
    name: "Family Feast",
    description: "2 Large Pizzas + 1.5L Drink + Loaded Fries",
    price: 2499,
    oldPrice: 2999,
    image: dealImages.get("deal-family"),
  },
  {
    name: "Couple Deal",
    description: "1 Medium Pizza + 2 Drinks + Fries",
    price: 1399,
    oldPrice: 1699,
    image: dealImages.get("deal-couple"),
  },
  {
    name: "Burger Deal",
    description: "2 Chicken Burgers + Fries + 2 Drinks",
    price: 1199,
    oldPrice: 1499,
    image: dealImages.get("deal-burger"),
  },
];

const Deals = () => {
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

      <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
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
                  Rs. {deal.price}
                </span>

                <span className="text-gray-400 line-through">
                  Rs. {deal.oldPrice}
                </span>
              </div>

              <Link
                to="/menu"
                className="mt-6 block rounded-xl bg-orange-600 px-5 py-3 text-center font-bold text-white hover:bg-orange-700"
              >
                Order Deal
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Deals;
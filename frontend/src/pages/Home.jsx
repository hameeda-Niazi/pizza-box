import { Link } from "react-router-dom";
import { FiArrowRight, FiTruck, FiClock, FiAward } from "react-icons/fi";

const Home = () => {
  return (
    <div>
      <section className="overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-block rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-600">
              Fresh • Hot • Delicious
            </span>

            <h1 className="mt-6 text-5xl font-black leading-tight text-gray-950 md:text-6xl">
              Your Favorite
              <span className="block text-orange-600">Pizza Is Here!</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Delicious pizzas, burgers, fries and refreshing drinks prepared
              fresh for you. Order your favorites today.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/menu"
                className="flex items-center gap-2 rounded-full bg-orange-600 px-7 py-3.5 font-bold text-white hover:bg-orange-700"
              >
                Order Now
                <FiArrowRight />
              </Link>

              <Link
                to="/deals"
                className="rounded-full border-2 border-orange-600 px-7 py-3.5 font-bold text-orange-600 hover:bg-orange-600 hover:text-white"
              >
                View Deals
              </Link>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="flex h-80 w-80 items-center justify-center rounded-full border-8 border-white bg-[url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=90')] bg-cover bg-center text-[0px] shadow-2xl md:h-96 md:w-96">
              🍕
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-12 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <FiTruck className="text-3xl text-orange-600" />
          <h3 className="mt-4 text-xl font-bold">Fast Delivery</h3>
          <p className="mt-2 text-gray-500">
            Hot food delivered to your doorstep.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <FiClock className="text-3xl text-orange-600" />
          <h3 className="mt-4 text-xl font-bold">Fresh Every Time</h3>
          <p className="mt-2 text-gray-500">
            Fresh ingredients prepared when you order.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <FiAward className="text-3xl text-orange-600" />
          <h3 className="mt-4 text-xl font-bold">Quality Food</h3>
          <p className="mt-2 text-gray-500">
            Great taste with quality ingredients.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;

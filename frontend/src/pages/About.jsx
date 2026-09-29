const About = () => {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="font-bold text-orange-600">ABOUT PIZZA BOX</span>

          <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
            Good Food Brings
            <span className="block text-orange-600">
              People Together
            </span>
          </h1>

          <p className="mt-6 leading-8 text-gray-600">
            Pizza Box is a food ordering experience focused on delicious
            pizzas, burgers, fries and drinks. Our goal is to make ordering
            tasty food simple, fast and enjoyable.
          </p>

          <p className="mt-4 leading-8 text-gray-600">
            From fresh ingredients to careful preparation, we want every
            order to be something you enjoy sharing with your family and
            friends.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="flex h-80 w-80 items-center justify-center rounded-full border-8 border-white bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=85')] bg-cover bg-center text-[0px] shadow-xl">
            🍕
          </div>
        </div>
      </div>

      <div className="mt-16 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-7 text-center shadow-sm">
          <h2 className="text-4xl font-black text-orange-600">10+</h2>
          <p className="mt-2 text-gray-500">Menu Items</p>
        </div>

        <div className="rounded-2xl bg-white p-7 text-center shadow-sm">
          <h2 className="text-4xl font-black text-orange-600">5+</h2>
          <p className="mt-2 text-gray-500">Branches</p>
        </div>

        <div className="rounded-2xl bg-white p-7 text-center shadow-sm">
          <h2 className="text-4xl font-black text-orange-600">1000+</h2>
          <p className="mt-2 text-gray-500">Happy Customers</p>
        </div>
      </div>
    </section>
  );
};

export default About;

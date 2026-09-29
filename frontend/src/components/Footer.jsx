import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiMapPin,
  FiPhone,
  FiMail,
} from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="mt-20 bg-gray-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="text-2xl font-black text-orange-500">
            Pizza<span className="text-white">Box</span>
          </h2>

          <p className="mt-4 leading-7 text-gray-400">
            Fresh, hot and delicious food delivered straight to your door.
            Made with quality ingredients and lots of love.
          </p>

          <div className="mt-5 flex gap-3">
            <a href="#" className="rounded-full bg-gray-800 p-3 hover:bg-orange-600">
              <FiFacebook />
            </a>
            <a href="#" className="rounded-full bg-gray-800 p-3 hover:bg-orange-600">
              <FiInstagram />
            </a>
            <a href="#" className="rounded-full bg-gray-800 p-3 hover:bg-orange-600">
              <FiTwitter />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold">Quick Links</h3>

          <div className="flex flex-col gap-3 text-gray-400">
            <Link to="/" className="hover:text-orange-500">Home</Link>
            <Link to="/menu" className="hover:text-orange-500">Menu</Link>
            <Link to="/deals" className="hover:text-orange-500">Deals</Link>
            <Link to="/about" className="hover:text-orange-500">About</Link>
            <Link to="/contact" className="hover:text-orange-500">Contact</Link>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold">Contact</h3>

          <div className="space-y-4 text-gray-400">
            <p className="flex gap-3">
              <FiMapPin className="mt-1 text-orange-500" />
              Peshawar, Pakistan
            </p>

            <p className="flex gap-3">
              <FiPhone className="mt-1 text-orange-500" />
              +92 XXX XXXXXXX
            </p>

            <p className="flex gap-3">
              <FiMail className="mt-1 text-orange-500" />
              hello@pizzabox.com
            </p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-lg font-bold">Opening Hours</h3>

          <p className="text-gray-400">Monday - Sunday</p>
          <p className="mt-2 font-semibold text-orange-500">
            11:00 AM - 12:00 AM
          </p>

          <Link
            to="/menu"
            className="mt-6 inline-block rounded-full bg-orange-600 px-6 py-3 font-semibold hover:bg-orange-700"
          >
            Order Now
          </Link>
        </div>
      </div>

      <div className="border-t border-gray-800 py-5 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Pizza Box. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
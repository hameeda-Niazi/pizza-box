import { FiShoppingCart } from "react-icons/fi";

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="h-52 overflow-hidden bg-orange-50">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-7xl">
            🍕
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>

          <span className="whitespace-nowrap font-bold text-orange-600">
            PKR {product.price.toLocaleString()}
          </span>
        </div>

        <p className="min-h-12 text-sm leading-6 text-gray-500">
          {product.description || "Fresh and delicious Pizza Box favorite."}
        </p>

        <button
          onClick={() => onAddToCart(product)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700"
        >
          <FiShoppingCart />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

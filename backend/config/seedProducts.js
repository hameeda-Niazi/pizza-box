const Product = require("../models/Product");
const defaultProducts = require("../data/defaultProducts");

const seedProducts = async () => {
  const result = await Product.bulkWrite(
    defaultProducts.map((product) => ({
      updateOne: {
        filter: { slug: product.slug },
        update: { $setOnInsert: product },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  if (result.upsertedCount) {
    console.log(`Added ${result.upsertedCount} missing Pizza Box menu items`);
  }
};

module.exports = seedProducts;

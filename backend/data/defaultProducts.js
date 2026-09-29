const image = (photoId) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=900&q=85`;

module.exports = [
  ["chicken-tikka-pizza", "Chicken Tikka Pizza", "Smoky chicken tikka, onions, capsicum and mozzarella on our signature crust.", 1299, "Pizzas", image("1565299624946-b28f40a0ae38")],
  ["chicken-fajita-pizza", "Chicken Fajita Pizza", "Spiced fajita chicken with jalapeños, onions and creamy pizza sauce.", 1349, "Pizzas", image("1574071318508-1cdbab80d002")],
  ["garden-veggie-pizza", "Garden Veggie Pizza", "Mushrooms, olives, sweet corn, peppers and generous mozzarella.", 1149, "Pizzas", image("1571407970349-bc81e7e96d47")],
  ["zinger-burger", "Zinger Burger", "Crunchy chicken fillet, lettuce and zesty house mayo in a toasted bun.", 549, "Burgers", image("1568901346375-23c9450c58cd")],
  ["smoky-bbq-burger", "Smoky BBQ Burger", "Grilled chicken patty, cheddar, caramelised onions and barbecue sauce.", 599, "Burgers", image("1550547660-d9450f859349")],
  ["double-cheese-burger", "Double Cheese Burger", "Two chicken patties with double cheese, pickles and burger sauce.", 699, "Burgers", image("1561758033-d89a9ad46330")],
  ["loaded-fries", "Loaded Fries", "Crisp fries topped with cheese sauce, chicken chunks and mayo.", 449, "Sides", image("1573080496219-bb080dd4f877")],
  ["hot-wings", "Hot Wings (6 pcs)", "Six crispy chicken wings tossed in fiery house-made hot sauce.", 579, "Sides", image("1527477396000-e27163b481c2")],
  ["cheesy-garlic-bread", "Cheesy Garlic Bread", "Golden garlic bread with mozzarella and Italian herbs.", 349, "Sides", image("1552332386-f8dd00dc2f85")],
  ["chicken-tikka-wrap", "Chicken Tikka Wrap", "Chargrilled tikka chicken, fresh salad and mint mayo wrapped warm.", 499, "Wraps", image("1626700051175-6818013e1d4f")],
  ["crispy-chicken-wrap", "Crispy Chicken Wrap", "Crispy chicken strips, crunchy slaw and ranch in a soft tortilla.", 529, "Wraps", image("1569718212165-3a8278d5f624")],
  ["spicy-ranch-wrap", "Spicy Ranch Wrap", "Tender chicken, jalapeños, cheese and spicy ranch in a toasted wrap.", 549, "Wraps", image("1594212699903-ec8a3eca50f5")],
  ["cola", "Cola (500 ml)", "Ice-cold fizzy cola to pair perfectly with your meal.", 140, "Drinks", image("1544145945-f90425340c7e")],
  ["lemon-mint-fizz", "Lemon Mint Fizz", "A chilled blend of lemon, fresh mint and sparkling soda.", 249, "Drinks", image("1551024709-8f23befc6f87")],
  ["mineral-water", "Mineral Water", "A chilled 500 ml bottle of mineral water.", 80, "Drinks", image("1548839140-29a749e1cf4d")],
  ["chocolate-fudge-brownie", "Chocolate Fudge Brownie", "Rich, gooey chocolate brownie with a chocolate drizzle.", 329, "Desserts", image("1606313564200-e75d5e30476c")],
  ["molten-lava-cake", "Molten Lava Cake", "Warm chocolate cake with a soft flowing chocolate centre.", 379, "Desserts", image("1578985545062-69928b1d9587")],
  ["choco-chip-cookie", "Choco Chip Cookie", "A soft-baked chocolate chip cookie, fresh from the oven.", 199, "Desserts", image("1499636136210-6f4ee915583e")],
  ["family-feast", "Family Feast", "Two large pizzas, loaded fries and a 1.5L drink for the whole table.", 2999, "Deals", image("1513104890138-7c749659a591")],
  ["couple-combo", "Couple Combo", "One medium pizza, two drinks and cheesy garlic bread for sharing.", 1799, "Deals", image("1593560708920-61dd98c46a4e")],
  ["burger-box-deal", "Burger Box Deal", "Two zinger burgers, regular fries and two chilled drinks.", 1599, "Deals", image("1593504049359-74330189a345")],
].map(([slug, name, description, price, category, image]) => ({ slug, name, description, price, category, image }));

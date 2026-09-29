const image = (photoId) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=900&q=85`;

export const products = [
  { _id: "pizza-tikka", name: "Chicken Tikka Pizza", description: "Smoky chicken tikka, onions, capsicum and mozzarella on our signature crust.", price: 1299, category: "Pizzas", image: image("1565299624946-b28f40a0ae38") },
  { _id: "pizza-fajita", name: "Chicken Fajita Pizza", description: "Spiced fajita chicken with jalapeños, onions and a creamy pizza sauce.", price: 1349, category: "Pizzas", image: image("1574071318508-1cdbab80d002") },
  { _id: "pizza-veggie", name: "Garden Veggie Pizza", description: "Mushrooms, olives, sweet corn, peppers and a generous layer of cheese.", price: 1149, category: "Pizzas", image: image("1571407970349-bc81e7e96d47") },

  { _id: "burger-zinger", name: "Zinger Burger", description: "Crunchy fried chicken fillet, lettuce and our zesty house mayo in a toasted bun.", price: 549, category: "Burgers", image: image("1568901346375-23c9450c58cd") },
  { _id: "burger-smoky", name: "Smoky BBQ Burger", description: "Grilled chicken patty, cheddar, caramelised onions and smoky barbecue sauce.", price: 599, category: "Burgers", image: image("1550547660-d9450f859349") },
  { _id: "burger-double", name: "Double Cheese Burger", description: "Two juicy chicken patties with double cheese, pickles and burger sauce.", price: 699, category: "Burgers", image: image("1561758033-d89a9ad46330") },

  { _id: "side-loaded-fries", name: "Loaded Fries", description: "Crisp fries topped with cheese sauce, chicken chunks and a drizzle of mayo.", price: 449, category: "Sides", image: image("1573080496219-bb080dd4f877") },
  { _id: "side-wings", name: "Hot Wings (6 pcs)", description: "Six crispy chicken wings tossed in a fiery house-made hot sauce.", price: 579, category: "Sides", image: image("1527477396000-e27163b481c2") },
  { _id: "side-garlic-bread", name: "Cheesy Garlic Bread", description: "Golden garlic bread baked with melted mozzarella and Italian herbs.", price: 349, category: "Sides", image: image("1552332386-f8dd00dc2f85") },

  { _id: "wrap-tikka", name: "Chicken Tikka Wrap", description: "Chargrilled tikka chicken, fresh salad and mint mayo wrapped warm.", price: 499, category: "Wraps", image: image("1626700051175-6818013e1d4f") },
  { _id: "wrap-crispy", name: "Crispy Chicken Wrap", description: "Crispy chicken strips, crunchy slaw and ranch sauce in a soft tortilla.", price: 529, category: "Wraps", image: image("1569718212165-3a8278d5f624") },
  { _id: "wrap-spicy", name: "Spicy Ranch Wrap", description: "Tender chicken, jalapeños, cheese and spicy ranch sauce in a toasted wrap.", price: 549, category: "Wraps", image: image("1594212699903-ec8a3eca50f5") },

  { _id: "drink-cola", name: "Cola (500 ml)", description: "Ice-cold, fizzy cola to pair perfectly with your meal.", price: 140, category: "Drinks", image: image("1544145945-f90425340c7e") },
  { _id: "drink-lemon-mint", name: "Lemon Mint Fizz", description: "A bright, chilled blend of lemon, fresh mint and sparkling soda.", price: 249, category: "Drinks", image: image("1551024709-8f23befc6f87") },
  { _id: "drink-water", name: "Mineral Water", description: "A chilled 500 ml bottle of mineral water.", price: 80, category: "Drinks", image: image("1548839140-29a749e1cf4d") },

  { _id: "dessert-brownie", name: "Chocolate Fudge Brownie", description: "Rich, gooey chocolate brownie finished with a chocolate drizzle.", price: 329, category: "Desserts", image: image("1606313564200-e75d5e30476c") },
  { _id: "dessert-lava-cake", name: "Molten Lava Cake", description: "Warm chocolate cake with a soft, flowing chocolate centre.", price: 379, category: "Desserts", image: image("1578985545062-69928b1d9587") },
  { _id: "dessert-cookie", name: "Choco Chip Cookie", description: "A soft-baked chocolate chip cookie, fresh from the oven.", price: 199, category: "Desserts", image: image("1499636136210-6f4ee915583e") },

  { _id: "deal-family", name: "Family Feast", description: "Two large pizzas, loaded fries and a 1.5L drink for the whole table.", price: 2999, category: "Deals", image: image("1513104890138-7c749659a591") },
  { _id: "deal-couple", name: "Couple Combo", description: "One medium pizza, two drinks and cheesy garlic bread made for sharing.", price: 1799, category: "Deals", image: image("1593560708920-61dd98c46a4e") },
  { _id: "deal-burger", name: "Burger Box Deal", description: "Two zinger burgers, regular fries and two chilled drinks.", price: 1599, category: "Deals", image: image("1593504049359-74330189a345") },
];

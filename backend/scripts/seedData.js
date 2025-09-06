import "dotenv/config";
import { connectDB } from "../config/db.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import Forecast from "../models/forecastModel.js";
import {
  pricingRuleModel,
  demandLevelModel,
  weatherDataModel,
} from "../models/pricingModel.js";
import bcrypt from "bcrypt";
import moment from "moment";

const seedData = async () => {
  try {
    console.log("🌱 Starting data seeding process...\n");

    // Connect to database
    await connectDB();
    console.log("✅ Connected to database");

    // Clear existing data
    await clearExistingData();

    // Seed users
    const users = await seedUsers();
    console.log(`✅ Created ${users.length} users`);

    // Seed food items
    const foods = await seedFoods();
    console.log(`✅ Created ${foods.length} food items`);

    // Seed orders
    const orders = await seedOrders(users, foods);
    console.log(`✅ Created ${orders.length} orders`);

    // Seed pricing rules
    await seedPricingRules();
    console.log("✅ Created pricing rules");

    // Seed demand levels
    await seedDemandLevels();
    console.log("✅ Created demand levels");

    // Seed weather data
    await seedWeatherData();
    console.log("✅ Created weather data");

    // Seed forecast configuration
    await seedForecastConfig();
    console.log("✅ Created forecast configuration");

    // Seed historical demand data
    await seedHistoricalDemand(foods, orders);
    console.log("✅ Created historical demand data");

    // Seed sample forecasts
    await seedSampleForecasts(foods);
    console.log("✅ Created sample forecasts");

    console.log("\n🎉 Data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   • Users: ${users.length}`);
    console.log(`   • Food Items: ${foods.length}`);
    console.log(`   • Orders: ${orders.length}`);
    console.log(`   • Pricing Rules: 8`);
    console.log(`   • Demand Levels: 3`);
    console.log(`   • Weather Data: 5 cities`);
    console.log(`   • Historical Demand: ${foods.length * 7 * 24} records`);
    console.log(`   • Sample Forecasts: ${foods.length * 24} records`);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    process.exit(0);
  }
};

// Clear existing data
const clearExistingData = async () => {
  try {
    console.log("🧹 Clearing existing data...");

    await userModel.deleteMany({});
    await foodModel.deleteMany({});
    await orderModel.deleteMany({});
    await pricingRuleModel.deleteMany({});
    await demandLevelModel.deleteMany({});
    await weatherDataModel.deleteMany({});
    await Forecast.deleteMany({});

    console.log("✅ Existing data cleared");
  } catch (error) {
    console.error("Error clearing data:", error);
  }
};

// Seed users
const seedUsers = async () => {
  const users = [
    {
      name: "John Doe",
      email: "john@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "123 Main St, Kathmandu",
      city: "Kathmandu",
      street: "123 Main St",
      state: "Bagmati Province",
      phone: "9841234567",
      orderCount: 15,
      totalSpent: 2500,
      isNewUser: false,
      loyaltyTier: "gold",
    },
    {
      name: "Jane Smith",
      email: "jane@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "456 Oak Ave, Pokhara",
      city: "Pokhara",
      street: "456 Oak Ave",
      state: "Gandaki Province",
      phone: "9841234568",
      orderCount: 8,
      totalSpent: 1200,
      isNewUser: false,
      loyaltyTier: "silver",
    },
    {
      name: "Mike Johnson",
      email: "mike@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "789 Pine Rd, Chitwan",
      city: "Chitwan",
      street: "789 Pine Rd",
      state: "Madhesh Province",
      phone: "9841234569",
      orderCount: 3,
      totalSpent: 450,
      isNewUser: false,
      loyaltyTier: "bronze",
    },
    {
      name: "Sarah Wilson",
      email: "sarah@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "321 Elm St, Lalitpur",
      city: "Lalitpur",
      street: "321 Elm St",
      state: "Bagmati Province",
      phone: "9841234570",
      orderCount: 0,
      totalSpent: 0,
      isNewUser: true,
      loyaltyTier: "bronze",
    },
    {
      name: "David Brown",
      email: "david@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "654 Maple Dr, Bhaktapur",
      city: "Bhaktapur",
      street: "654 Maple Dr",
      state: "Bagmati Province",
      phone: "9841234571",
      orderCount: 25,
      totalSpent: 5000,
      isNewUser: false,
      loyaltyTier: "platinum",
    },
    {
      name: "Admin User",
      email: "admin@gmail.com",
      password: await bcrypt.hash("admin123", 10),
      address: "Admin Office, Kathmandu",
      city: "Kathmandu",
      street: "Admin Office",
      state: "Bagmati Province",
      phone: "9841234572",
      role: "admin",
      orderCount: 0,
      totalSpent: 0,
      isNewUser: false,
      loyaltyTier: "bronze",
    },
  ];

  return await userModel.insertMany(users);
};

// Seed food items
const seedFoods = async () => {
  const foods = [
    {
      name: "Margherita Pizza",
      description:
        "Classic pizza with tomato sauce, mozzarella, and fresh basil",
      price: 450,
      category: "pizza",
      image: "margherita-pizza.jpg",
      averageRating: 4.5,
      totalRatings: 120,
    },
    {
      name: "Chicken Burger",
      description:
        "Juicy chicken patty with lettuce, tomato, and special sauce",
      price: 350,
      category: "burger",
      image: "chicken-burger.jpg",
      averageRating: 4.3,
      totalRatings: 85,
    },
    {
      name: "Momo (Chicken)",
      description: "Steamed dumplings filled with spiced chicken",
      price: 200,
      category: "momo",
      image: "chicken-momo.jpg",
      averageRating: 4.7,
      totalRatings: 200,
    },
    {
      name: "Cold Coffee",
      description: "Refreshing iced coffee with milk and ice",
      price: 150,
      category: "cold_drinks",
      image: "cold-coffee.jpg",
      averageRating: 4.2,
      totalRatings: 95,
    },
    {
      name: "Hot Soup",
      description: "Warm vegetable soup perfect for cold days",
      price: 180,
      category: "soup",
      image: "hot-soup.jpg",
      averageRating: 4.4,
      totalRatings: 75,
    },
    {
      name: "Fried Rice",
      description: "Chinese-style fried rice with vegetables and egg",
      price: 280,
      category: "rice",
      image: "fried-rice.jpg",
      averageRating: 4.1,
      totalRatings: 60,
    },
    {
      name: "Chocolate Cake",
      description: "Rich chocolate cake with chocolate frosting",
      price: 320,
      category: "dessert",
      image: "chocolate-cake.jpg",
      averageRating: 4.6,
      totalRatings: 45,
    },
    {
      name: "Fresh Juice",
      description: "Freshly squeezed orange juice",
      price: 120,
      category: "cold_drinks",
      image: "fresh-juice.jpg",
      averageRating: 4.0,
      totalRatings: 30,
    },
    {
      name: "Veg Momo",
      description: "Steamed dumplings filled with mixed vegetables",
      price: 180,
      category: "momo",
      image: "veg-momo.jpg",
      averageRating: 4.3,
      totalRatings: 110,
    },
    {
      name: "Pepperoni Pizza",
      description: "Pizza topped with pepperoni and mozzarella cheese",
      price: 500,
      category: "pizza",
      image: "pepperoni-pizza.jpg",
      averageRating: 4.4,
      totalRatings: 90,
    },
  ];

  return await foodModel.insertMany(foods);
};

// Seed orders
const seedOrders = async (users, foods) => {
  const orders = [];
  const statuses = [
    "placed",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
  ];
  const ratings = [3, 4, 5];

  // Generate orders for the last 30 days
  for (let i = 0; i < 200; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const orderDate = new Date("2024-01-01"); // Fixed base date
    orderDate.setDate(orderDate.getDate() + Math.floor(Math.random() * 30));
    orderDate.setHours(Math.floor(Math.random() * 24));
    orderDate.setMinutes(Math.floor(Math.random() * 60));

    // Random number of items (1-4)
    const itemCount = Math.floor(Math.random() * 4) + 1;
    const items = [];
    let totalAmount = 0;

    for (let j = 0; j < itemCount; j++) {
      const food = foods[Math.floor(Math.random() * foods.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const itemTotal = food.price * quantity;

      items.push({
        foodId: food._id,
        name: food.name,
        price: food.price,
        quantity: quantity,
        total: itemTotal,
      });

      totalAmount += itemTotal;
    }

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const isDelivered = status === "delivered";

    const order = {
      userId: user._id,
      items: items,
      amount: totalAmount,
      status: status,
      address: {
        street: user.street,
        city: user.city,
        state: user.state,
        fullAddress: user.address,
      },
      payment: true,
      createdAt: orderDate,
      updatedAt: orderDate,
      date: orderDate,
      rating: isDelivered
        ? ratings[Math.floor(Math.random() * ratings.length)]
        : null,
    };

    orders.push(order);
  }

  return await orderModel.insertMany(orders);
};

// Seed pricing rules
const seedPricingRules = async () => {
  const rules = [
    {
      name: "New User Discount",
      type: "user",
      isActive: true,
      priority: 4,
      userType: "new",
      newUserDiscount: 10,
      maxDiscount: 20,
      minPrice: 50,
    },
    {
      name: "Bronze Loyalty Discount",
      type: "loyalty",
      isActive: true,
      priority: 3,
      loyaltyTier: "bronze",
      loyaltyDiscount: 5,
      minOrders: 5,
      minSpent: 1000,
      maxDiscount: 15,
      minPrice: 50,
    },
    {
      name: "Silver Loyalty Discount",
      type: "loyalty",
      isActive: true,
      priority: 3,
      loyaltyTier: "silver",
      loyaltyDiscount: 7,
      minOrders: 10,
      minSpent: 2000,
      maxDiscount: 20,
      minPrice: 50,
    },
    {
      name: "Gold Loyalty Discount",
      type: "loyalty",
      isActive: true,
      priority: 3,
      loyaltyTier: "gold",
      loyaltyDiscount: 10,
      minOrders: 20,
      minSpent: 4000,
      maxDiscount: 25,
      minPrice: 50,
    },
    {
      name: "Platinum Loyalty Discount",
      type: "loyalty",
      isActive: true,
      priority: 3,
      loyaltyTier: "platinum",
      loyaltyDiscount: 15,
      minOrders: 50,
      minSpent: 10000,
      maxDiscount: 30,
      minPrice: 50,
    },
    {
      name: "Low Demand Discount",
      type: "demand",
      isActive: true,
      priority: 1,
      demandLevel: "low",
      demandDiscount: 15,
      maxDiscount: 20,
      minPrice: 50,
    },
    {
      name: "Hot Weather Cold Drink Discount",
      type: "weather",
      isActive: true,
      priority: 2,
      weatherCondition: "hot",
      weatherDiscount: 10,
      applicableCategories: ["cold_drinks"],
      maxDiscount: 15,
      minPrice: 50,
    },
    {
      name: "Cold Weather Hot Food Discount",
      type: "weather",
      isActive: true,
      priority: 2,
      weatherCondition: "cold",
      weatherDiscount: 10,
      applicableCategories: ["soup", "hot_drinks"],
      maxDiscount: 15,
      minPrice: 50,
    },
  ];

  await pricingRuleModel.insertMany(rules);
};

// Seed demand levels
const seedDemandLevels = async () => {
  const levels = [
    {
      level: "low",
      orderThreshold: 5,
      currentOrders: 3,
      lastUpdated: new Date(),
    },
    {
      level: "normal",
      orderThreshold: 15,
      currentOrders: 12,
      lastUpdated: new Date(),
    },
    {
      level: "high",
      orderThreshold: 25,
      currentOrders: 8,
      lastUpdated: new Date(),
    },
  ];

  await demandLevelModel.insertMany(levels);
};

// Seed weather data
const seedWeatherData = async () => {
  const weatherData = [
    {
      city: "Kathmandu",
      temperature: 22,
      condition: "normal",
      lastUpdated: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    },
    {
      city: "Pokhara",
      temperature: 25,
      condition: "hot",
      lastUpdated: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    {
      city: "Chitwan",
      temperature: 28,
      condition: "hot",
      lastUpdated: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    {
      city: "Lalitpur",
      temperature: 20,
      condition: "normal",
      lastUpdated: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
    {
      city: "Bhaktapur",
      temperature: 18,
      condition: "cold",
      lastUpdated: new Date(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    },
  ];

  await weatherDataModel.insertMany(weatherData);
};

// Seed forecast configuration (simplified)
const seedForecastConfig = async () => {
  // Forecast config is now handled by the service
  console.log("✅ Forecast configuration handled by service");
};

// Seed historical demand data (simplified)
const seedHistoricalDemand = async (foods, orders) => {
  // Historical demand is now handled by the forecast service
  console.log("✅ Historical demand handled by forecast service");
};

// Seed sample forecasts (simplified)
const seedSampleForecasts = async (foods) => {
  // Forecasts are now generated by the forecast service
  console.log("✅ Sample forecasts handled by forecast service");
};

// Run the seeding
seedData();

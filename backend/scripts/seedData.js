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
      name: "Prakash Sharma",
      email: "prakash@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "New Road, Kathmandu",
      city: "Kathmandu",
      street: "New Road",
      state: "Bagmati Province",
      phone: "9841234567",
      orderCount: 15,
      totalSpent: 2500,
      isNewUser: false,
      loyaltyTier: "gold",
    },
    {
      name: "Sita Gurung",
      email: "sita@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Lakeside, Pokhara",
      city: "Pokhara",
      street: "Lakeside",
      state: "Gandaki Province",
      phone: "9841234568",
      orderCount: 8,
      totalSpent: 1200,
      isNewUser: false,
      loyaltyTier: "silver",
    },
    {
      name: "Rajesh Thapa",
      email: "rajesh@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Sauraha, Chitwan",
      city: "Chitwan",
      street: "Sauraha",
      state: "Madhesh Province",
      phone: "9841234569",
      orderCount: 3,
      totalSpent: 450,
      isNewUser: false,
      loyaltyTier: "bronze",
    },
    {
      name: "Anita Maharjan",
      email: "anita@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Patan Durbar Square, Lalitpur",
      city: "Lalitpur",
      street: "Patan Durbar Square",
      state: "Bagmati Province",
      phone: "9841234570",
      orderCount: 0,
      totalSpent: 0,
      isNewUser: true,
      loyaltyTier: "bronze",
    },
    {
      name: "Bikram Rana",
      email: "bikram@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Durbar Square, Bhaktapur",
      city: "Bhaktapur",
      street: "Durbar Square",
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
    {
      name: "Sunita Tamang",
      email: "sunita@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Thamel, Kathmandu",
      city: "Kathmandu",
      street: "Thamel",
      state: "Bagmati Province",
      phone: "9841234573",
      orderCount: 12,
      totalSpent: 1800,
      isNewUser: false,
      loyaltyTier: "silver",
    },
    {
      name: "Krishna Poudel",
      email: "krishna@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Biratnagar Main Road, Biratnagar",
      city: "Biratnagar",
      street: "Main Road",
      state: "Province 1",
      phone: "9841234574",
      orderCount: 7,
      totalSpent: 1050,
      isNewUser: false,
      loyaltyTier: "bronze",
    },
    {
      name: "Rita Shrestha",
      email: "rita@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Baneshwor, Kathmandu",
      city: "Kathmandu",
      street: "Baneshwor",
      state: "Bagmati Province",
      phone: "9841234575",
      orderCount: 18,
      totalSpent: 3200,
      isNewUser: false,
      loyaltyTier: "gold",
    },
    {
      name: "Hari Magar",
      email: "hari@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Bharatpur Chowk, Bharatpur",
      city: "Bharatpur",
      street: "Bharatpur Chowk",
      state: "Madhesh Province",
      phone: "9841234576",
      orderCount: 4,
      totalSpent: 600,
      isNewUser: false,
      loyaltyTier: "bronze",
    },
    {
      name: "Laxmi Basnet",
      email: "laxmi@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Butwal Main Street, Butwal",
      city: "Butwal",
      street: "Main Street",
      state: "Lumbini Province",
      phone: "9841234577",
      orderCount: 9,
      totalSpent: 1350,
      isNewUser: false,
      loyaltyTier: "silver",
    },
    {
      name: "Suresh Karki",
      email: "suresh@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Dharan Bazaar, Dharan",
      city: "Dharan",
      street: "Bazaar",
      state: "Province 1",
      phone: "9841234578",
      orderCount: 13,
      totalSpent: 1950,
      isNewUser: false,
      loyaltyTier: "silver",
    },
    {
      name: "Gita Limbu",
      email: "gita@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Ilam Bazaar, Ilam",
      city: "Ilam",
      street: "Bazaar",
      state: "Province 1",
      phone: "9841234579",
      orderCount: 3,
      totalSpent: 450,
      isNewUser: false,
      loyaltyTier: "bronze",
    },
    {
      name: "Narayan Joshi",
      email: "narayan@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Nepalgunj Main Road, Nepalgunj",
      city: "Nepalgunj",
      street: "Main Road",
      state: "Lumbini Province",
      phone: "9841234580",
      orderCount: 10,
      totalSpent: 1500,
      isNewUser: false,
      loyaltyTier: "silver",
    },
    {
      name: "Kamala Rai",
      email: "kamala@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Dhangadhi Chowk, Dhangadhi",
      city: "Dhangadhi",
      street: "Chowk",
      state: "Sudurpashchim Province",
      phone: "9841234581",
      orderCount: 7,
      totalSpent: 1050,
      isNewUser: false,
      loyaltyTier: "bronze",
    },
    {
      name: "Ram Bahadur",
      email: "ram@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Mahendranagar Main Street, Mahendranagar",
      city: "Mahendranagar",
      street: "Main Street",
      state: "Sudurpashchim Province",
      phone: "9841234582",
      orderCount: 14,
      totalSpent: 2100,
      isNewUser: false,
      loyaltyTier: "gold",
    },
    {
      name: "Sushila Adhikari",
      email: "sushila@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Hetauda Chowk, Hetauda",
      city: "Hetauda",
      street: "Chowk",
      state: "Bagmati Province",
      phone: "9841234583",
      orderCount: 6,
      totalSpent: 900,
      isNewUser: false,
      loyaltyTier: "bronze",
    },
    {
      name: "Kumar Thakuri",
      email: "kumar@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Tansen Bazaar, Tansen",
      city: "Tansen",
      street: "Bazaar",
      state: "Lumbini Province",
      phone: "9841234584",
      orderCount: 9,
      totalSpent: 1350,
      isNewUser: false,
      loyaltyTier: "silver",
    },
    {
      name: "Mina Chhetri",
      email: "mina@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Dhangadhi Main Road, Dhangadhi",
      city: "Dhangadhi",
      street: "Main Road",
      state: "Sudurpashchim Province",
      phone: "9841234585",
      orderCount: 4,
      totalSpent: 600,
      isNewUser: false,
      loyaltyTier: "bronze",
    },
    {
      name: "Bishnu Pandey",
      email: "bishnu@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Janakpur Chowk, Janakpur",
      city: "Janakpur",
      street: "Chowk",
      state: "Madhesh Province",
      phone: "9841234586",
      orderCount: 16,
      totalSpent: 2400,
      isNewUser: false,
      loyaltyTier: "gold",
    },
    {
      name: "Pramila Shrestha",
      email: "pramila@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Durbar Marg, Kathmandu",
      city: "Kathmandu",
      street: "Durbar Marg",
      state: "Bagmati Province",
      phone: "9841234587",
      orderCount: 11,
      totalSpent: 1650,
      isNewUser: false,
      loyaltyTier: "silver",
    },
    {
      name: "Dilip Maharjan",
      email: "dilip@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Patan Chowk, Lalitpur",
      city: "Lalitpur",
      street: "Patan Chowk",
      state: "Bagmati Province",
      phone: "9841234588",
      orderCount: 8,
      totalSpent: 1200,
      isNewUser: false,
      loyaltyTier: "bronze",
    },
    {
      name: "Sabina Gurung",
      email: "sabina@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Pokhara Lakeside, Pokhara",
      city: "Pokhara",
      street: "Lakeside",
      state: "Gandaki Province",
      phone: "9841234589",
      orderCount: 5,
      totalSpent: 750,
      isNewUser: false,
      loyaltyTier: "bronze",
    },
    {
      name: "Ramesh Thapa",
      email: "ramesh@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Chitwan National Park, Chitwan",
      city: "Chitwan",
      street: "National Park Road",
      state: "Madhesh Province",
      phone: "9841234590",
      orderCount: 12,
      totalSpent: 1800,
      isNewUser: false,
      loyaltyTier: "silver",
    },
    {
      name: "Sangita Rai",
      email: "sangita@gmail.com",
      password: await bcrypt.hash("password123", 10),
      address: "Biratnagar Bazaar, Biratnagar",
      city: "Biratnagar",
      street: "Bazaar",
      state: "Province 1",
      phone: "9841234591",
      orderCount: 6,
      totalSpent: 900,
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
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const orderDate = new Date(
      thirtyDaysAgo.getTime() +
        Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
    );
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

// Seed forecast configuration
const seedForecastConfig = async () => {
  console.log("✅ Forecast configuration ready");
};

// Seed historical demand data
const seedHistoricalDemand = async (foods, orders) => {
  console.log("✅ Historical demand data ready");
};

// Seed real forecasts
const seedSampleForecasts = async (foods) => {
  try {
    const forecasts = [];

    for (const food of foods) {
      const foodForecasts = generateRealForecasts(food._id);
      forecasts.push(...foodForecasts);
    }

    if (forecasts.length > 0) {
      await Forecast.insertMany(forecasts);
      console.log(`✅ Created ${forecasts.length} real forecasts`);
    }
  } catch (error) {
    console.error("Error creating forecasts:", error);
  }
};

// Generate realistic forecasts based on food patterns
const generateRealForecasts = (foodId) => {
  const forecasts = [];
  const baseDemand = Math.random() * 8 + 3; // 3-11 base demand
  let maxDemand = 0;
  let peakHour = 0;

  for (let hour = 0; hour < 24; hour++) {
    const isPeakHour = hour >= 18 && hour <= 21; // Dinner time
    const isLunchHour = hour >= 12 && hour <= 14; // Lunch time
    const isLowHour = hour >= 2 && hour <= 6; // Late night/early morning
    const isBreakfastHour = hour >= 7 && hour <= 9; // Breakfast time

    let demand = baseDemand;

    // Apply realistic hourly patterns
    if (isPeakHour) demand *= 2.5; // Dinner peak
    else if (isLunchHour) demand *= 2.0; // Lunch peak
    else if (isBreakfastHour) demand *= 1.5; // Breakfast moderate
    else if (isLowHour) demand *= 0.2; // Very low at night
    else demand *= 0.8; // Regular hours

    // Add some randomness (±20%)
    demand *= 0.8 + Math.random() * 0.4;

    // Track peak hour
    if (demand > maxDemand) {
      maxDemand = demand;
      peakHour = hour;
    }

    const confidence = 0.75 + Math.random() * 0.15; // 0.75-0.9
    const margin = demand * (1 - confidence) * 0.3;

    forecasts.push({
      foodId,
      forecastHour: hour,
      predictions: {
        pointForecast: Math.round(demand),
        lowerBound: Math.round(Math.max(0, demand - margin)),
        upperBound: Math.round(demand + margin),
        confidence,
      },
      weatherFactor: 0.9 + Math.random() * 0.2, // 0.9-1.1
      demandLevel: demand > 15 ? "high" : demand > 8 ? "medium" : "low",
    });
  }

  return forecasts;
};

// Run the seeding
seedData();

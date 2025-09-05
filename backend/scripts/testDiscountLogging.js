import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import pricingService from "../services/pricingService.js";
import demandService from "../services/demandService.js";
import weatherService from "../services/weatherService.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// Test script to demonstrate discount logging
async function testDiscountLogging() {
  try {
    console.log("🚀 Starting Discount Logging Test...\n");

    // Connect to database
    await connectDB();
    console.log("✅ Connected to database\n");

    // Initialize services
    await demandService.initialize();
    await pricingService.initializeDefaultRules();

    // Create test users with different loyalty tiers
    const testUsers = [
      {
        name: "New User",
        email: "newuser@test.com",
        password: "hashedpassword",
        city: "Kathmandu",
        street: "Test Street",
        state: "Bagmati Province",
        phone: "1234567890",
        orderCount: 0,
        totalSpent: 0,
        isNewUser: true,
        loyaltyTier: "bronze",
      },
      {
        name: "Bronze User",
        email: "bronze@test.com",
        password: "hashedpassword",
        city: "Kathmandu",
        street: "Test Street",
        state: "Bagmati Province",
        phone: "1234567891",
        orderCount: 6,
        totalSpent: 150,
        isNewUser: false,
        loyaltyTier: "bronze",
      },
      {
        name: "Gold User",
        email: "gold@test.com",
        password: "hashedpassword",
        city: "Kathmandu",
        street: "Test Street",
        state: "Bagmati Province",
        phone: "1234567892",
        orderCount: 25,
        totalSpent: 600,
        isNewUser: false,
        loyaltyTier: "gold",
      },
    ];

    // Create test food items
    const testFoods = [
      {
        name: "Hot Soup",
        description: "A warm soup perfect for cold days",
        price: 100,
        image: "soup.jpg",
        category: "soup",
      },
      {
        name: "Cold Drink",
        description: "Refreshing drink for hot days",
        price: 50,
        image: "cold-drink.jpg",
        category: "cold_drinks",
      },
      {
        name: "Regular Pizza",
        description: "Delicious pizza",
        price: 200,
        image: "pizza.jpg",
        category: "pizza",
      },
    ];

    // Save test data
    const savedUsers = [];
    const savedFoods = [];

    for (const user of testUsers) {
      const newUser = new userModel(user);
      await newUser.save();
      savedUsers.push(newUser);
    }

    for (const food of testFoods) {
      const newFood = new foodModel(food);
      await newFood.save();
      savedFoods.push(newFood);
    }

    console.log("📝 Test data created successfully\n");

    // Test pricing for each user and food combination
    for (const user of savedUsers) {
      console.log(
        `\n👤 Testing pricing for ${user.name} (${user.loyaltyTier} tier):`
      );
      console.log("=" * 50);

      for (const food of savedFoods) {
        await pricingService.calculateDynamicPrice(food, user._id, user.city);
      }
    }

    // Test weather service
    console.log("\n🌤️ Testing weather service:");
    await weatherService.getWeatherData("Kathmandu");

    // Test demand service
    console.log("\n📊 Testing demand service:");
    await demandService.updateDemandLevel();

    console.log("\n🎉 Discount logging test completed!");
    console.log("\n📋 Check the console logs above to see:");
    console.log("   • Dynamic pricing calculations for each user");
    console.log("   • Weather data and categorization");
    console.log("   • Demand level updates");
    console.log("   • Applied discounts and savings amounts");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Clean up test data
    try {
      await userModel.deleteMany({ email: { $regex: /@test\.com$/ } });
      await foodModel.deleteMany({
        name: { $in: ["Hot Soup", "Cold Drink", "Regular Pizza"] },
      });
      console.log("\n🧹 Test data cleaned up");
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }

    process.exit(0);
  }
}

// Run the test
testDiscountLogging();

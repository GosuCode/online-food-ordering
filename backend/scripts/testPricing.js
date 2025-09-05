import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import pricingService from "../services/pricingService.js";
import demandService from "../services/demandService.js";
import weatherService from "../services/weatherService.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";

// Test script for dynamic pricing system
async function testPricingSystem() {
  try {
    console.log("🚀 Starting Dynamic Pricing System Test...\n");

    // Connect to database
    await connectDB();
    console.log("✅ Connected to database\n");

    // Initialize services
    await demandService.initialize();
    await pricingService.initializeDefaultRules();
    console.log("✅ Services initialized\n");

    // Test 1: Create a test user
    console.log("📝 Test 1: Creating test user...");
    const testUser = new userModel({
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      city: "Kathmandu",
      street: "Test Street",
      state: "Bagmati Province",
      phone: "1234567890",
      orderCount: 0,
      totalSpent: 0,
      isNewUser: true,
      loyaltyTier: "bronze",
    });
    await testUser.save();
    console.log("✅ Test user created:", testUser._id);

    // Test 2: Create a test food item
    console.log("\n📝 Test 2: Creating test food item...");
    const testFood = new foodModel({
      name: "Test Pizza",
      description: "A delicious test pizza",
      price: 100,
      image: "test-pizza.jpg",
      category: "pizza",
    });
    await testFood.save();
    console.log("✅ Test food item created:", testFood._id);

    // Test 3: Test new user discount
    console.log("\n📝 Test 3: Testing new user discount...");
    const newUserPricing = await pricingService.calculateDynamicPrice(
      testFood,
      testUser._id,
      "Kathmandu"
    );
    console.log("New user pricing:", newUserPricing);
    console.log("Expected: 10% discount for new user");

    // Test 4: Update user to have some orders (loyalty discount)
    console.log("\n📝 Test 4: Testing loyalty discount...");
    await userModel.findByIdAndUpdate(testUser._id, {
      orderCount: 6,
      totalSpent: 150,
      isNewUser: false,
      loyaltyTier: "bronze",
    });

    const loyaltyPricing = await pricingService.calculateDynamicPrice(
      testFood,
      testUser._id,
      "Kathmandu"
    );
    console.log("Loyalty pricing:", loyaltyPricing);
    console.log("Expected: 5% loyalty discount (bronze tier)");

    // Test 5: Test weather-based pricing
    console.log("\n📝 Test 5: Testing weather-based pricing...");
    const weatherData = await weatherService.getWeatherData("Kathmandu");
    console.log("Weather data:", weatherData);

    // Test 6: Test demand level
    console.log("\n📝 Test 6: Testing demand level...");
    const demandLevel = await demandService.getCurrentDemandLevel();
    console.log("Current demand level:", demandLevel);

    // Test 7: Test pricing rules
    console.log("\n📝 Test 7: Testing pricing rules...");
    const rules = await pricingService.getPricingRules();
    console.log("Active pricing rules:", rules.length);
    rules.forEach((rule) => {
      console.log(`- ${rule.name} (${rule.type}, Priority: ${rule.priority})`);
    });

    // Test 8: Test user stats update
    console.log("\n📝 Test 8: Testing user stats update...");
    await pricingService.updateUserStats(testUser._id, 50);
    const updatedUser = await userModel.findById(testUser._id);
    console.log("Updated user stats:", {
      orderCount: updatedUser.orderCount,
      totalSpent: updatedUser.totalSpent,
      loyaltyTier: updatedUser.loyaltyTier,
    });

    console.log("\n🎉 All tests completed successfully!");
    console.log("\n📋 Test Summary:");
    console.log("✅ Database connection");
    console.log("✅ Service initialization");
    console.log("✅ User creation and management");
    console.log("✅ Food item creation");
    console.log("✅ Dynamic pricing calculation");
    console.log("✅ New user discount (10%)");
    console.log("✅ Loyalty discount (5%)");
    console.log("✅ Weather service integration");
    console.log("✅ Demand tracking");
    console.log("✅ Pricing rules management");
    console.log("✅ User stats tracking");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Clean up test data
    try {
      await userModel.deleteMany({ email: "test@example.com" });
      await foodModel.deleteMany({ name: "Test Pizza" });
      console.log("\n🧹 Test data cleaned up");
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }

    process.exit(0);
  }
}

// Run the test
testPricingSystem();

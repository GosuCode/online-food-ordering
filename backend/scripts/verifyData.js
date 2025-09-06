import "dotenv/config";
import { connectDB } from "../config/db.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import {
  DemandForecast,
  HistoricalDemand,
  ForecastConfig,
} from "../models/forecastModel.js";
import {
  pricingRuleModel,
  demandLevelModel,
  weatherDataModel,
} from "../models/pricingModel.js";

const verifyData = async () => {
  try {
    console.log("🔍 Verifying seeded data...\n");

    // Connect to database
    await connectDB();
    console.log("✅ Connected to database");

    // Count records in each collection
    const userCount = await userModel.countDocuments();
    const foodCount = await foodModel.countDocuments();
    const orderCount = await orderModel.countDocuments();
    const pricingRuleCount = await pricingRuleModel.countDocuments();
    const demandLevelCount = await demandLevelModel.countDocuments();
    const weatherDataCount = await weatherDataModel.countDocuments();
    const forecastCount = await DemandForecast.countDocuments();
    const historicalCount = await HistoricalDemand.countDocuments();
    const configCount = await ForecastConfig.countDocuments();

    console.log("📊 Data Verification Results:");
    console.log(`   • Users: ${userCount}`);
    console.log(`   • Food Items: ${foodCount}`);
    console.log(`   • Orders: ${orderCount}`);
    console.log(`   • Pricing Rules: ${pricingRuleCount}`);
    console.log(`   • Demand Levels: ${demandLevelCount}`);
    console.log(`   • Weather Data: ${weatherDataCount}`);
    console.log(`   • Forecasts: ${forecastCount}`);
    console.log(`   • Historical Demand: ${historicalCount}`);
    console.log(`   • Forecast Config: ${configCount}`);

    // Show sample data
    console.log("\n👥 Sample Users:");
    const users = await userModel
      .find({})
      .limit(3)
      .select("name email city loyaltyTier orderCount totalSpent");
    users.forEach((user) => {
      console.log(
        `   • ${user.name} (${user.email}) - ${user.city} - ${user.loyaltyTier} tier - ${user.orderCount} orders - $${user.totalSpent} spent`
      );
    });

    console.log("\n🍕 Sample Food Items:");
    const foods = await foodModel
      .find({})
      .limit(3)
      .select("name price category averageRating totalRatings");
    foods.forEach((food) => {
      console.log(
        `   • ${food.name} - Rs.${food.price} - ${food.category} - ${food.averageRating}⭐ (${food.totalRatings} reviews)`
      );
    });

    console.log("\n📦 Sample Orders:");
    const orders = await orderModel
      .find({})
      .limit(3)
      .select("userId amount status createdAt rating");
    for (const order of orders) {
      const user = await userModel.findById(order.userId).select("name");
      console.log(
        `   • Order by ${user?.name} - Rs.${order.amount} - ${order.status} - ${
          order.rating ? order.rating + "⭐" : "No rating"
        }`
      );
    }

    console.log("\n💰 Sample Pricing Rules:");
    const rules = await pricingRuleModel
      .find({})
      .limit(3)
      .select("name type priority isActive");
    rules.forEach((rule) => {
      console.log(
        `   • ${rule.name} (${rule.type}) - Priority: ${rule.priority} - ${
          rule.isActive ? "Active" : "Inactive"
        }`
      );
    });

    console.log("\n🌤️ Sample Weather Data:");
    const weather = await weatherDataModel
      .find({})
      .limit(3)
      .select("city temperature condition");
    weather.forEach((w) => {
      console.log(`   • ${w.city} - ${w.temperature}°C - ${w.condition}`);
    });

    console.log("\n📈 Sample Forecasts:");
    const forecasts = await DemandForecast.find({})
      .limit(3)
      .select("foodName forecastHour predictions");
    forecasts.forEach((forecast) => {
      console.log(
        `   • ${forecast.foodName} at ${forecast.forecastHour}:00 - ${
          forecast.predictions.pointForecast
        } units (${(forecast.predictions.confidence * 100).toFixed(
          1
        )}% confidence)`
      );
    });

    console.log("\n✅ Data verification completed successfully!");
  } catch (error) {
    console.error("❌ Error verifying data:", error);
  } finally {
    process.exit(0);
  }
};

// Run the verification
verifyData();

import { connectDB } from "../config/db.js";
import forecastService from "../services/forecastService.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

const testForecast = async () => {
  try {
    console.log("🚀 Starting Forecast System Test...\n");

    // Connect to database
    await connectDB();
    console.log("✅ Connected to database");

    // Initialize forecast service
    await forecastService.initialize();
    console.log("✅ Forecast service initialized");

    // Get a food item to test with
    const foodItem = await foodModel.findOne();
    if (!foodItem) {
      console.log("❌ No food items found. Please add some food items first.");
      return;
    }

    console.log(`\n📊 Testing with food item: ${foodItem.name}`);

    // Collect historical data
    console.log("\n📈 Collecting historical data...");
    const historicalData = await forecastService.collectHistoricalData(
      foodItem._id,
      7
    );
    console.log(`✅ Collected ${historicalData.length} historical data points`);

    // Generate forecast
    console.log("\n🔮 Generating forecast...");
    const forecasts = await forecastService.generateForecast(foodItem._id, 24);

    if (forecasts && forecasts.length > 0) {
      console.log(`✅ Generated ${forecasts.length} forecast points`);

      // Display sample forecasts
      console.log("\n📋 Sample Forecasts:");
      forecasts.slice(0, 5).forEach((forecast, index) => {
        console.log(`\n${index + 1}. Hour ${forecast.forecastHour}:00`);
        console.log(`   Forecast: ${forecast.predictions.pointForecast} units`);
        console.log(
          `   Range: ${forecast.predictions.lowerBound} - ${forecast.predictions.upperBound}`
        );
        console.log(
          `   Confidence: ${(forecast.predictions.confidence * 100).toFixed(
            1
          )}%`
        );
        console.log(`   Weather Factor: ${forecast.weatherFactor.toFixed(2)}x`);
      });

      // Get forecast summary
      console.log("\n📊 Getting forecast summary...");
      const summary = await forecastService.getForecastSummary();
      console.log(`✅ Retrieved summary for ${summary.length} food items`);

      if (summary.length > 0) {
        console.log("\n📈 Forecast Summary:");
        summary.forEach((item, index) => {
          console.log(`\n${index + 1}. ${item.foodName}:`);
          console.log(`   Total Demand (24h): ${item.totalDemand}`);
          console.log(`   Peak Hour: ${item.peakHour}:00`);
          console.log(`   Peak Demand: ${item.peakDemand}`);
          console.log(`   Confidence: ${(item.confidence * 100).toFixed(1)}%`);
          if (item.alerts.length > 0) {
            console.log(`   Alerts: ${item.alerts.join(", ")}`);
          }
        });
      }
    } else {
      console.log(
        "⚠️ No forecasts generated. This might be due to insufficient historical data."
      );
    }

    console.log("\n🎉 Forecast system test completed successfully!");
    console.log("\n📋 What was tested:");
    console.log("   • Database connection");
    console.log("   • Forecast service initialization");
    console.log("   • Historical data collection");
    console.log("   • Forecast generation");
    console.log("   • Forecast summary");
    console.log("   • Weather integration");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    process.exit(0);
  }
};

// Run the test
testForecast();

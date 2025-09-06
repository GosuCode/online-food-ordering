import Forecast from "../models/forecastModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

class ForecastService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log("Initializing forecast service...");

      const existingForecasts = await Forecast.countDocuments({});

      if (existingForecasts === 0) {
        console.log("No forecasts found, generating initial forecasts...");
        await this.generateInitialForecasts();
      }

      this.isInitialized = true;
      console.log("Forecast service initialized successfully");
    } catch (error) {
      console.error("Error initializing forecast service:", error);
    }
  }

  async generateInitialForecasts() {
    try {
      const foods = await foodModel.find({});
      const forecasts = [];

      for (const food of foods) {
        const foodForecasts = this.generateMockForecasts(food._id);
        forecasts.push(...foodForecasts);
      }

      if (forecasts.length > 0) {
        await Forecast.insertMany(forecasts);
        console.log(`Generated ${forecasts.length} initial forecasts`);
      }
    } catch (error) {
      console.error("Error generating initial forecasts:", error);
    }
  }

  generateMockForecasts(foodId, hours = 24) {
    const forecasts = [];
    const baseDemand = Math.random() * 8 + 3; // 3-11 base demand (more realistic)

    for (let i = 0; i < hours; i++) {
      const hour = i; // Use 0-23 for proper hourly progression
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
  }

  async getForecastForFood(foodId, hours = 24) {
    try {
      const forecasts = await Forecast.find({
        foodId,
      })
        .sort({ forecastHour: 1 })
        .limit(hours);

      return forecasts;
    } catch (error) {
      console.error("Error getting forecast for food:", error);
      return [];
    }
  }

  async getHistoricalDemand(foodId, days = 7) {
    try {
      const orders = await orderModel
        .find({
          "items._id": foodId,
        })
        .sort({ createdAt: -1 })
        .limit(100); // Get recent orders

      // Group by hour
      const hourlyData = {};
      orders.forEach((order) => {
        const hour = new Date(order.createdAt).getHours();
        const itemInOrder = order.items.find((item) => item._id === foodId);
        if (itemInOrder) {
          if (!hourlyData[hour]) {
            hourlyData[hour] = 0;
          }
          hourlyData[hour] += itemInOrder.quantity;
        }
      });

      return Object.entries(hourlyData).map(([hour, totalQuantity]) => ({
        hour: parseInt(hour),
        totalQuantity,
      }));
    } catch (error) {
      console.error("Error getting historical demand:", error);
      return [];
    }
  }

  async generateAlerts() {
    try {
      const forecasts = await Forecast.find({});

      const alerts = [];

      // Check for high demand alerts
      const highDemandItems = forecasts.filter(
        (f) => f.predictions.pointForecast > 20
      );
      if (highDemandItems.length > 0) {
        alerts.push({
          severity: "warning",
          message: "High demand expected",
          count: highDemandItems.length,
        });
      }

      // Check for low confidence alerts
      const lowConfidenceItems = forecasts.filter(
        (f) => f.predictions.confidence < 0.7
      );
      if (lowConfidenceItems.length > 0) {
        alerts.push({
          severity: "info",
          message: "Low confidence forecasts",
          count: lowConfidenceItems.length,
        });
      }

      return alerts;
    } catch (error) {
      console.error("Error generating alerts:", error);
      return [];
    }
  }
}

const forecastService = new ForecastService();
export default forecastService;

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
      let itemsWithHistory = 0;
      let itemsSkipped = 0;

      for (const food of foods) {
        const historicalData = await this.getHistoricalDemand(food._id);
        const hasHistory = historicalData.length > 0;

        if (hasHistory) {
          const foodForecasts = this.generateForecastsFromHistory(
            food._id,
            historicalData
          );
          forecasts.push(...foodForecasts);
          itemsWithHistory++;
        } else {
          itemsSkipped++;
          console.log(
            `⏭️  Skipping forecast generation for "${food.name}" - no order history yet`
          );
        }
      }

      if (forecasts.length > 0) {
        await Forecast.insertMany(forecasts);
        console.log(
          `✅ Generated ${forecasts.length} forecasts for ${itemsWithHistory} items with order history`
        );
        if (itemsSkipped > 0) {
          console.log(
            `ℹ️  Skipped ${itemsSkipped} new items without order history`
          );
        }
      } else {
        console.log(
          "ℹ️  No forecasts generated - no items have order history yet"
        );
      }
    } catch (error) {
      console.error("Error generating initial forecasts:", error);
    }
  }

  generateForecastsFromHistory(foodId, historicalData, hours = 24) {
    const forecasts = [];

    const hourlyAverages = {};
    historicalData.forEach((data) => {
      if (!hourlyAverages[data.hour]) {
        hourlyAverages[data.hour] = [];
      }
      hourlyAverages[data.hour].push(data.totalQuantity);
    });

    const allDemands = historicalData.map((d) => d.totalQuantity);
    const baseDemand =
      allDemands.length > 0
        ? allDemands.reduce((a, b) => a + b, 0) / allDemands.length
        : 3;

    for (let hour = 0; hour < hours; hour++) {
      const isPeakHour = hour >= 18 && hour <= 21;
      const isLunchHour = hour >= 12 && hour <= 14;
      const isLowHour = hour >= 2 && hour <= 6;
      const isBreakfastHour = hour >= 7 && hour <= 9;

      let demand = hourlyAverages[hour]
        ? hourlyAverages[hour].reduce((a, b) => a + b, 0) /
          hourlyAverages[hour].length
        : baseDemand;

      if (!hourlyAverages[hour]) {
        if (isPeakHour) demand *= 2.5;
        else if (isLunchHour) demand *= 2.0;
        else if (isBreakfastHour) demand *= 1.5;
        else if (isLowHour) demand *= 0.2;
        else demand *= 0.8;
      }

      demand *= 0.85 + Math.random() * 0.3;

      const confidence = historicalData.length > 10 ? 0.8 : 0.65;
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
        weatherFactor: 0.9 + Math.random() * 0.2,
        demandLevel: demand > 15 ? "high" : demand > 8 ? "medium" : "low",
      });
    }

    return forecasts;
  }

  generateDefaultForecasts(foodId, hours = 24) {
    const forecasts = [];
    const baseDemand = 2;

    for (let hour = 0; hour < hours; hour++) {
      const isPeakHour = hour >= 18 && hour <= 21;
      const isLunchHour = hour >= 12 && hour <= 14;
      const isLowHour = hour >= 2 && hour <= 6;
      const isBreakfastHour = hour >= 7 && hour <= 9;

      let demand = baseDemand;

      if (isPeakHour) demand *= 2.5;
      else if (isLunchHour) demand *= 2.0;
      else if (isBreakfastHour) demand *= 1.5;
      else if (isLowHour) demand *= 0.2;
      else demand *= 0.8;

      const confidence = 0.5;
      const margin = demand * (1 - confidence) * 0.5;

      forecasts.push({
        foodId,
        forecastHour: hour,
        predictions: {
          pointForecast: Math.round(demand),
          lowerBound: Math.round(Math.max(0, demand - margin)),
          upperBound: Math.round(demand + margin),
          confidence,
        },
        weatherFactor: 1.0,
        demandLevel: "low",
      });
    }

    return forecasts;
  }

  generateMockForecasts(foodId, hours = 24) {
    return this.generateDefaultForecasts(foodId, hours);
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
          $or: [{ "items._id": foodId }, { "items.foodId": foodId }],
        })
        .sort({ createdAt: -1 })
        .limit(100);

      const hourlyData = {};
      orders.forEach((order) => {
        const hour = new Date(order.createdAt || order.date).getHours();
        const itemInOrder = order.items.find(
          (item) =>
            item._id?.toString() === foodId.toString() ||
            item.foodId?.toString() === foodId.toString()
        );
        if (itemInOrder) {
          if (!hourlyData[hour]) {
            hourlyData[hour] = 0;
          }
          hourlyData[hour] += itemInOrder.quantity || 1;
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

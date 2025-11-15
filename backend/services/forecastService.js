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
    const hourlyCounts = {};

    historicalData.forEach((data) => {
      const hour = data.hour;
      if (!hourlyAverages[hour]) {
        hourlyAverages[hour] = 0;
        hourlyCounts[hour] = 0;
      }
      hourlyAverages[hour] += data.totalQuantity;
      hourlyCounts[hour]++;
    });

    Object.keys(hourlyAverages).forEach((hour) => {
      hourlyAverages[hour] = hourlyAverages[hour] / hourlyCounts[hour];
    });

    const allDemands = historicalData.map((d) => d.totalQuantity);
    const baseDemand =
      allDemands.length > 0
        ? allDemands.reduce((a, b) => a + b, 0) / allDemands.length
        : 0;

    const variance =
      allDemands.length > 1
        ? allDemands.reduce((sum, val) => {
            const diff = val - baseDemand;
            return sum + diff * diff;
          }, 0) / allDemands.length
        : 0;
    const stdDev = Math.sqrt(variance);

    for (let hour = 0; hour < hours; hour++) {
      let demand = 0;
      const dataPointsForHour = hourlyCounts[hour] || 0;

      if (hourlyAverages[hour] !== undefined) {
        demand = hourlyAverages[hour];
      } else {
        demand = 0;
      }

      const confidence =
        dataPointsForHour > 10
          ? 0.85
          : dataPointsForHour > 5
          ? 0.75
          : dataPointsForHour > 0
          ? 0.65
          : 0.5;

      const margin = dataPointsForHour > 0 ? stdDev * (1 - confidence) : 0;

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

      const historicalData = [];
      orders.forEach((order) => {
        const hour = new Date(order.createdAt || order.date).getHours();
        const itemInOrder = order.items.find(
          (item) =>
            item._id?.toString() === foodId.toString() ||
            item.foodId?.toString() === foodId.toString()
        );
        if (itemInOrder) {
          historicalData.push({
            hour: hour,
            totalQuantity: itemInOrder.quantity || 1,
          });
        }
      });

      return historicalData;
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

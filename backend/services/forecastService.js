import {
  DemandForecast,
  HistoricalDemand,
  ForecastConfig,
} from "../models/forecastModel.js";
import orderModel from "../models/orderModel.js";
import foodModel from "../models/foodModel.js";
import { weatherService } from "./weatherService.js";
import moment from "moment";

class ForecastService {
  constructor() {
    this.isInitialized = false;
    this.config = null;
  }

  // Initialize the forecasting service
  async initialize() {
    try {
      console.log("🔮 Initializing Demand Forecasting Service...");

      // Load or create default configuration
      this.config = await this.loadConfiguration();

      // Initialize default configuration if none exists
      if (!this.config) {
        await this.createDefaultConfiguration();
        this.config = await this.loadConfiguration();
      }

      this.isInitialized = true;
      console.log("✅ Demand Forecasting Service initialized");
    } catch (error) {
      console.error("❌ Error initializing forecast service:", error);
    }
  }

  // Load forecast configuration
  async loadConfiguration() {
    try {
      return await ForecastConfig.findOne({ isActive: true });
    } catch (error) {
      console.error("Error loading forecast configuration:", error);
      return null;
    }
  }

  // Create default configuration
  async createDefaultConfiguration() {
    try {
      const defaultConfig = new ForecastConfig({
        defaultParams: {
          p: 2,
          d: 1,
          q: 2,
          seasonal: true,
          seasonalP: 1,
          seasonalD: 1,
          seasonalQ: 1,
          seasonalPeriod: 24,
        },
        trainingWindow: 30,
        minDataPoints: 168,
        retrainFrequency: 7,
        forecastHorizon: 24,
        confidenceLevel: 0.95,
        weatherEnabled: true,
        weatherWeight: 0.2,
        alerts: {
          lowAccuracy: 0.7,
          highVariance: 0.3,
          modelError: true,
        },
      });

      await defaultConfig.save();
      console.log("📋 Default forecast configuration created");
    } catch (error) {
      console.error("Error creating default configuration:", error);
    }
  }

  // Collect and prepare historical demand data
  async collectHistoricalData(foodId, days = 30) {
    try {
      console.log(
        `📊 Collecting historical data for food ${foodId} (${days} days)`
      );

      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - days * 24 * 60 * 60 * 1000
      );

      // Get orders for the food item in the specified period
      const orders = await orderModel.find({
        createdAt: { $gte: startDate, $lte: endDate },
        "items.foodId": foodId,
        status: {
          $in: [
            "placed",
            "confirmed",
            "preparing",
            "out_for_delivery",
            "delivered",
          ],
        },
      });

      // Process orders into hourly demand data
      const hourlyData = {};

      orders.forEach((order) => {
        const orderDate = new Date(order.createdAt);
        const hour = orderDate.getHours();
        const dateKey = orderDate.toISOString().split("T")[0];
        const hourKey = `${dateKey}_${hour}`;

        if (!hourlyData[hourKey]) {
          hourlyData[hourKey] = {
            date: orderDate,
            hour: hour,
            dayOfWeek: orderDate.getDay(),
            orderCount: 0,
            totalQuantity: 0,
            revenue: 0,
            weather: null,
          };
        }

        // Find the specific food item in the order
        const foodItem = order.items.find(
          (item) => item.foodId.toString() === foodId.toString()
        );
        if (foodItem) {
          hourlyData[hourKey].orderCount += 1;
          hourlyData[hourKey].totalQuantity += foodItem.quantity;
          hourlyData[hourKey].revenue += foodItem.price * foodItem.quantity;
        }
      });

      // Get weather data for each day
      const weatherData = {};
      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split("T")[0];
        try {
          const weather = await weatherService.getWeatherData("Kathmandu");
          weatherData[dateStr] = weather;
        } catch (error) {
          console.log(`Weather data not available for ${dateStr}`);
        }
      }

      // Create historical demand records
      const historicalRecords = [];
      for (const [hourKey, data] of Object.entries(hourlyData)) {
        const dateStr = data.date.toISOString().split("T")[0];
        const weather = weatherData[dateStr];

        // Determine demand level
        let demandLevel = "normal";
        if (data.totalQuantity < 5) demandLevel = "low";
        else if (data.totalQuantity > 20) demandLevel = "high";

        const record = new HistoricalDemand({
          foodId: foodId,
          foodName: data.foodName || "Unknown",
          date: data.date,
          hour: data.hour,
          dayOfWeek: data.dayOfWeek,
          orderCount: data.orderCount,
          totalQuantity: data.totalQuantity,
          revenue: data.revenue,
          weather: weather
            ? {
                temperature: weather.temperature,
                condition: weather.condition,
                humidity: weather.humidity || 50,
              }
            : null,
          demandLevel: demandLevel,
        });

        historicalRecords.push(record);
      }

      // Save historical data
      if (historicalRecords.length > 0) {
        await HistoricalDemand.insertMany(historicalRecords, {
          ordered: false,
        });
        console.log(
          `✅ Saved ${historicalRecords.length} historical demand records`
        );
      }

      return historicalRecords;
    } catch (error) {
      console.error("Error collecting historical data:", error);
      return [];
    }
  }

  // Simple ARIMA-like forecasting using moving averages and trends
  async generateForecast(foodId, hours = 24) {
    try {
      console.log(`🔮 Generating forecast for food ${foodId} (${hours} hours)`);

      if (!this.isInitialized) {
        await this.initialize();
      }

      // Get historical data
      const historicalData = await this.getHistoricalData(foodId);

      if (historicalData.length < this.config.minDataPoints) {
        console.log(
          `⚠️ Insufficient data for forecasting (${historicalData.length} < ${this.config.minDataPoints})`
        );
        return null;
      }

      // Prepare time series data
      const timeSeries = this.prepareTimeSeries(historicalData);

      // Generate forecasts for each hour
      const forecasts = [];
      const now = new Date();

      for (let i = 0; i < hours; i++) {
        const forecastTime = new Date(now.getTime() + i * 60 * 60 * 1000);
        const forecastHour = forecastTime.getHours();
        const dayOfWeek = forecastTime.getDay();

        // Calculate base forecast using moving averages
        const baseForecast = this.calculateBaseForecast(
          timeSeries,
          forecastHour,
          dayOfWeek
        );

        // Apply weather factor if available
        let weatherFactor = 1.0;
        if (this.config.weatherEnabled) {
          try {
            const weather = await weatherService.getWeatherData("Kathmandu");
            weatherFactor = this.calculateWeatherFactor(weather, foodId);
          } catch (error) {
            console.log("Weather data not available for forecast");
          }
        }

        // Calculate confidence interval
        const confidence = this.calculateConfidence(timeSeries, forecastHour);
        const variance = this.calculateVariance(timeSeries, forecastHour);

        const pointForecast = Math.round(baseForecast * weatherFactor);
        const margin = Math.round(pointForecast * variance * 0.3); // 30% margin

        const forecast = {
          foodId: foodId,
          foodName: historicalData[0]?.foodName || "Unknown",
          forecastDate: forecastTime,
          forecastHour: forecastHour,
          modelParams: this.config.defaultParams,
          predictions: {
            pointForecast: pointForecast,
            lowerBound: Math.max(0, pointForecast - margin),
            upperBound: pointForecast + margin,
            confidence: confidence,
            accuracy: 0.8, // Placeholder accuracy
          },
          weatherFactor: weatherFactor,
          dayOfWeek: dayOfWeek,
          isHoliday: false,
          specialEvent: null,
          modelAccuracy: 0.8,
          lastTrained: new Date(),
          trainingDataPoints: historicalData.length,
          status: "active",
        };

        forecasts.push(forecast);
      }

      // Save forecasts to database
      await this.saveForecasts(forecasts);

      console.log(`✅ Generated ${forecasts.length} forecast points`);
      return forecasts;
    } catch (error) {
      console.error("Error generating forecast:", error);
      return null;
    }
  }

  // Get historical data for a food item
  async getHistoricalData(foodId) {
    try {
      const endDate = new Date();
      const startDate = new Date(
        endDate.getTime() - this.config.trainingWindow * 24 * 60 * 60 * 1000
      );

      return await HistoricalDemand.find({
        foodId: foodId,
        date: { $gte: startDate, $lte: endDate },
      }).sort({ date: 1, hour: 1 });
    } catch (error) {
      console.error("Error getting historical data:", error);
      return [];
    }
  }

  // Prepare time series data for analysis
  prepareTimeSeries(historicalData) {
    const hourlyData = {};

    historicalData.forEach((record) => {
      const hour = record.hour;
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(record.totalQuantity);
    });

    return hourlyData;
  }

  // Calculate base forecast using moving averages
  calculateBaseForecast(timeSeries, hour, dayOfWeek) {
    const hourData = timeSeries[hour] || [];

    if (hourData.length === 0) {
      return 10; // Default forecast
    }

    // Calculate moving average
    const sum = hourData.reduce((a, b) => a + b, 0);
    const average = sum / hourData.length;

    // Apply day of week factor
    const dayFactor = this.getDayOfWeekFactor(dayOfWeek);

    return Math.round(average * dayFactor);
  }

  // Get day of week factor
  getDayOfWeekFactor(dayOfWeek) {
    const factors = {
      0: 1.2, // Sunday
      1: 0.8, // Monday
      2: 0.9, // Tuesday
      3: 0.9, // Wednesday
      4: 1.0, // Thursday
      5: 1.3, // Friday
      6: 1.4, // Saturday
    };

    return factors[dayOfWeek] || 1.0;
  }

  // Calculate weather factor
  calculateWeatherFactor(weather, foodId) {
    if (!weather) return 1.0;

    const temperature = weather.temperature;
    const condition = weather.condition;

    // Get food category to determine weather sensitivity
    // This would ideally come from the food model
    const isColdDrink = foodId.includes("drink") || foodId.includes("cold");
    const isHotFood = foodId.includes("soup") || foodId.includes("hot");

    let factor = 1.0;

    if (isColdDrink && temperature > 25) {
      factor = 1.3; // Hot weather increases cold drink demand
    } else if (isColdDrink && temperature < 15) {
      factor = 0.7; // Cold weather decreases cold drink demand
    }

    if (isHotFood && temperature < 15) {
      factor = 1.2; // Cold weather increases hot food demand
    } else if (isHotFood && temperature > 30) {
      factor = 0.8; // Hot weather decreases hot food demand
    }

    return factor;
  }

  // Calculate confidence level
  calculateConfidence(timeSeries, hour) {
    const hourData = timeSeries[hour] || [];

    if (hourData.length < 3) return 0.5;

    // Calculate coefficient of variation
    const mean = hourData.reduce((a, b) => a + b, 0) / hourData.length;
    const variance =
      hourData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / hourData.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;

    // Convert to confidence (lower CV = higher confidence)
    return Math.max(0.3, Math.min(0.95, 1 - cv));
  }

  // Calculate variance
  calculateVariance(timeSeries, hour) {
    const hourData = timeSeries[hour] || [];

    if (hourData.length < 2) return 0.3;

    const mean = hourData.reduce((a, b) => a + b, 0) / hourData.length;
    const variance =
      hourData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / hourData.length;
    const stdDev = Math.sqrt(variance);

    return Math.min(0.5, stdDev / mean);
  }

  // Save forecasts to database
  async saveForecasts(forecasts) {
    try {
      // Remove old forecasts for the same time period
      const startTime = forecasts[0].forecastDate;
      const endTime = forecasts[forecasts.length - 1].forecastDate;

      await DemandForecast.deleteMany({
        foodId: forecasts[0].foodId,
        forecastDate: { $gte: startTime, $lte: endTime },
      });

      // Save new forecasts
      await DemandForecast.insertMany(forecasts);
      console.log(`💾 Saved ${forecasts.length} forecasts to database`);
    } catch (error) {
      console.error("Error saving forecasts:", error);
    }
  }

  // Get forecasts for admin dashboard
  async getForecasts(foodId = null, hours = 24) {
    try {
      const query = {};
      if (foodId) {
        query.foodId = foodId;
      }

      const forecasts = await DemandForecast.find(query)
        .sort({ forecastDate: 1, forecastHour: 1 })
        .limit(hours);

      return forecasts;
    } catch (error) {
      console.error("Error getting forecasts:", error);
      return [];
    }
  }

  // Get forecast summary for dashboard
  async getForecastSummary() {
    try {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const forecasts = await DemandForecast.find({
        forecastDate: { $gte: now, $lte: next24Hours },
        status: "active",
      }).populate("foodId", "name category price");

      // Group by food item
      const summary = {};
      forecasts.forEach((forecast) => {
        const foodName = forecast.foodName;
        if (!summary[foodName]) {
          summary[foodName] = {
            foodId: forecast.foodId,
            foodName: foodName,
            totalDemand: 0,
            peakHour: null,
            peakDemand: 0,
            confidence: 0,
            alerts: [],
          };
        }

        summary[foodName].totalDemand += forecast.predictions.pointForecast;
        summary[foodName].confidence += forecast.predictions.confidence;

        if (forecast.predictions.pointForecast > summary[foodName].peakDemand) {
          summary[foodName].peakDemand = forecast.predictions.pointForecast;
          summary[foodName].peakHour = forecast.forecastHour;
        }
      });

      // Calculate average confidence and add alerts
      Object.values(summary).forEach((item) => {
        item.confidence = item.confidence / 24; // Average confidence

        if (item.confidence < this.config.alerts.lowAccuracy) {
          item.alerts.push("Low forecast accuracy");
        }

        if (item.totalDemand > 100) {
          item.alerts.push("High demand expected");
        }
      });

      return Object.values(summary);
    } catch (error) {
      console.error("Error getting forecast summary:", error);
      return [];
    }
  }
}

// Create singleton instance
const forecastService = new ForecastService();

export default forecastService;

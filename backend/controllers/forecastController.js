import Forecast from "../models/forecastModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

// Get forecast summary for all foods
export const getForecastSummary = async (req, res) => {
  try {
    // Get all foods with their forecasts
    const foods = await foodModel.find({});
    const summary = [];

    for (const food of foods) {
      const forecasts = await Forecast.find({
        foodId: food._id,
      }).sort({ forecastHour: 1 });

      if (forecasts.length === 0) {
        // Generate mock data if no forecasts exist
        summary.push({
          foodId: food._id,
          foodName: food.name,
          totalDemand: 150,
          peakHour: 19,
          peakDemand: 25,
          confidence: 0.85,
          alerts: [],
        });
      } else {
        const totalDemand = forecasts.reduce(
          (sum, f) => sum + f.predictions.pointForecast,
          0
        );
        const peakForecast = forecasts.reduce((max, f) =>
          f.predictions.pointForecast > max.predictions.pointForecast ? f : max
        );

        summary.push({
          foodId: food._id,
          foodName: food.name,
          totalDemand: Math.round(totalDemand),
          peakHour: peakForecast.forecastHour,
          peakDemand: Math.round(peakForecast.predictions.pointForecast),
          confidence: peakForecast.predictions.confidence,
          alerts: generateAlerts(forecasts),
        });
      }
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error fetching forecast summary:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching forecast summary",
    });
  }
};

// Get detailed forecast for a specific food
export const getFoodForecast = async (req, res) => {
  try {
    const { id } = req.params;
    const { hours = 24 } = req.query;

    const forecasts = await Forecast.find({
      foodId: id,
    })
      .sort({ forecastHour: 1 })
      .limit(parseInt(hours));

    if (forecasts.length === 0) {
      // Generate mock forecasts
      const mockForecasts = generateMockForecasts(id, parseInt(hours));
      return res.json({
        success: true,
        data: mockForecasts,
      });
    }

    res.json({
      success: true,
      data: forecasts,
    });
  } catch (error) {
    console.error("Error fetching food forecast:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching food forecast",
    });
  }
};

// Get historical data for a food item
export const getHistoricalData = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 7 } = req.query;

    // Get historical order data
    const orders = await orderModel
      .find({
        "items._id": id,
      })
      .sort({ createdAt: -1 })
      .limit(100);

    // Group by hour
    const hourlyData = {};
    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      const itemInOrder = order.items.find((item) => item._id === id);
      if (itemInOrder) {
        if (!hourlyData[hour]) {
          hourlyData[hour] = 0;
        }
        hourlyData[hour] += itemInOrder.quantity;
      }
    });

    const historicalData = Object.entries(hourlyData).map(
      ([hour, totalQuantity]) => ({
        hour: parseInt(hour),
        totalQuantity,
      })
    );

    res.json({
      success: true,
      data: historicalData,
    });
  } catch (error) {
    console.error("Error fetching historical data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching historical data",
    });
  }
};

// Get forecast alerts
export const getAlerts = async (req, res) => {
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

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching alerts",
    });
  }
};

// Get forecast configuration
export const getConfig = async (req, res) => {
  try {
    const config = {
      trainingWindow: 30, // days
      forecastHorizon: 24, // hours
      confidenceLevel: 0.8,
      weatherEnabled: true,
      demandThresholds: {
        low: 5,
        medium: 15,
        high: 25,
      },
    };

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching config",
    });
  }
};

// Generate forecasts for all foods
export const generateForecasts = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    const generatedForecasts = [];

    // Clear existing forecasts
    await Forecast.deleteMany({});

    for (const food of foods) {
      const forecasts = generateMockForecasts(food._id);
      await Forecast.insertMany(forecasts);
      generatedForecasts.push(...forecasts);
    }

    res.json({
      success: true,
      message: `Generated ${generatedForecasts.length} forecasts`,
      data: generatedForecasts,
    });
  } catch (error) {
    console.error("Error generating forecasts:", error);
    res.status(500).json({
      success: false,
      message: "Error generating forecasts",
    });
  }
};

// Helper function to generate mock forecasts
const generateMockForecasts = (foodId, hours = 24) => {
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
};

// Helper function to generate alerts
const generateAlerts = (forecasts) => {
  const alerts = [];
  const maxDemand = Math.max(
    ...forecasts.map((f) => f.predictions.pointForecast)
  );
  const minConfidence = Math.min(
    ...forecasts.map((f) => f.predictions.confidence)
  );

  if (maxDemand > 20) {
    alerts.push("High demand expected");
  }
  if (minConfidence < 0.7) {
    alerts.push("Low confidence forecast");
  }

  return alerts;
};

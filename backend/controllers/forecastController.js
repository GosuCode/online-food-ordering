import Forecast from "../models/forecastModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import forecastService from "../services/forecastService.js";

export const getForecastSummary = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    const summary = [];

    for (const food of foods) {
      const forecasts = await Forecast.find({
        foodId: food._id,
      }).sort({ forecastHour: 1 });

      if (forecasts.length === 0) {
        const historicalData = await forecastService.getHistoricalDemand(
          food._id
        );
        const hasHistory = historicalData.length > 0;

        if (hasHistory) {
          const tempForecasts = forecastService.generateForecastsFromHistory(
            food._id,
            historicalData
          );
          const totalDemand = tempForecasts.reduce(
            (sum, f) => sum + f.predictions.pointForecast,
            0
          );
          const peakForecast = tempForecasts.reduce((max, f) =>
            f.predictions.pointForecast > max.predictions.pointForecast
              ? f
              : max
          );

          summary.push({
            foodId: food._id,
            foodName: food.name,
            totalDemand: Math.round(totalDemand),
            peakHour: peakForecast.forecastHour,
            peakDemand: Math.round(peakForecast.predictions.pointForecast),
            confidence: peakForecast.predictions.confidence,
            alerts: generateAlerts(tempForecasts),
            hasForecast: true,
          });
        } else {
          summary.push({
            foodId: food._id,
            foodName: food.name,
            totalDemand: 0,
            peakHour: null,
            peakDemand: 0,
            confidence: 0,
            alerts: [],
            hasForecast: false,
            message:
              "No order history yet - forecasts will be available after first orders",
          });
        }
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

export const getFoodForecast = async (req, res) => {
  try {
    const { id } = req.params;
    const { hours = 24 } = req.query;

    const historicalData = await forecastService.getHistoricalDemand(id);
    const hasHistory = historicalData.length > 0;

    if (hasHistory) {
      const forecasts = forecastService.generateForecastsFromHistory(
        id,
        historicalData,
        parseInt(hours)
      );
      return res.json({
        success: true,
        data: forecasts,
      });
    }

    const storedForecasts = await Forecast.find({
      foodId: id,
    })
      .sort({ forecastHour: 1 })
      .limit(parseInt(hours));

    if (storedForecasts.length > 0) {
      return res.json({
        success: true,
        data: storedForecasts,
      });
    }

    return res.json({
      success: true,
      data: [],
      message:
        "No forecasts available yet. This item needs order history to generate accurate forecasts.",
    });
  } catch (error) {
    console.error("Error fetching food forecast:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching food forecast",
    });
  }
};

export const getHistoricalData = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 7 } = req.query;

    const orders = await orderModel
      .find({
        "items._id": id,
      })
      .sort({ createdAt: -1 })
      .limit(100);

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

export const getAlerts = async (req, res) => {
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

export const getConfig = async (req, res) => {
  try {
    const config = {
      trainingWindow: 30,
      forecastHorizon: 24,
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

export const generateForecasts = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    const generatedForecasts = [];

    await Forecast.deleteMany({});

    let itemsWithHistory = 0;
    let itemsWithoutHistory = 0;

    for (const food of foods) {
      const historicalData = await forecastService.getHistoricalDemand(
        food._id
      );
      const hasHistory = historicalData.length > 0;

      let forecasts;
      if (hasHistory) {
        forecasts = forecastService.generateForecastsFromHistory(
          food._id,
          historicalData
        );
        await Forecast.insertMany(forecasts);
        generatedForecasts.push(...forecasts);
        itemsWithHistory++;
      } else {
        itemsWithoutHistory++;
        console.log(`⏭️  Skipping "${food.name}" - no order history yet`);
      }
    }

    res.json({
      success: true,
      message: `Generated ${generatedForecasts.length} forecasts for ${itemsWithHistory} items with order history. ${itemsWithoutHistory} new items skipped (no order history yet).`,
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

const generateMockForecasts = (foodId, hours = 24) => {
  const forecasts = [];
  const baseDemand = Math.random() * 8 + 3;

  for (let i = 0; i < hours; i++) {
    const hour = i;
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

    demand *= 0.8 + Math.random() * 0.4;

    const confidence = 0.75 + Math.random() * 0.15;
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
};

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

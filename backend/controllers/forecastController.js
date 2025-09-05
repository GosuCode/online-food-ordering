import forecastService from "../services/forecastService.js";
import foodModel from "../models/foodModel.js";
import {
  DemandForecast,
  HistoricalDemand,
  ForecastConfig,
} from "../models/forecastModel.js";

// Get forecast summary for admin dashboard
const getForecastSummary = async (req, res) => {
  try {
    const summary = await forecastService.getForecastSummary();

    res.json({
      success: true,
      data: summary,
      message: "Forecast summary retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting forecast summary:", error);
    res.json({
      success: false,
      message: "Error retrieving forecast summary",
    });
  }
};

// Get detailed forecasts for a specific food item
const getFoodForecast = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { hours = 24 } = req.query;

    const forecasts = await forecastService.getForecasts(
      foodId,
      parseInt(hours)
    );

    res.json({
      success: true,
      data: forecasts,
      message: `Forecasts for food item retrieved successfully`,
    });
  } catch (error) {
    console.error("Error getting food forecast:", error);
    res.json({
      success: false,
      message: "Error retrieving food forecast",
    });
  }
};

// Generate new forecasts for all food items
const generateForecasts = async (req, res) => {
  try {
    console.log("🚀 Generating forecasts for all food items...");

    // Get all food items
    const foodItems = await foodModel.find({});

    const results = [];

    for (const foodItem of foodItems) {
      try {
        console.log(`📊 Processing ${foodItem.name}...`);

        // Collect historical data
        await forecastService.collectHistoricalData(foodItem._id, 30);

        // Generate forecast
        const forecasts = await forecastService.generateForecast(
          foodItem._id,
          24
        );

        if (forecasts) {
          results.push({
            foodId: foodItem._id,
            foodName: foodItem.name,
            forecastCount: forecasts.length,
            status: "success",
          });
        } else {
          results.push({
            foodId: foodItem._id,
            foodName: foodItem.name,
            forecastCount: 0,
            status: "insufficient_data",
          });
        }
      } catch (error) {
        console.error(`Error processing ${foodItem.name}:`, error);
        results.push({
          foodId: foodItem._id,
          foodName: foodItem.name,
          forecastCount: 0,
          status: "error",
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Generated forecasts for ${results.length} food items`,
    });
  } catch (error) {
    console.error("Error generating forecasts:", error);
    res.json({
      success: false,
      message: "Error generating forecasts",
    });
  }
};

// Get forecast configuration
const getForecastConfig = async (req, res) => {
  try {
    const config = await ForecastConfig.findOne({ isActive: true });

    if (!config) {
      return res.json({
        success: false,
        message: "Forecast configuration not found",
      });
    }

    res.json({
      success: true,
      data: config,
      message: "Forecast configuration retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting forecast config:", error);
    res.json({
      success: false,
      message: "Error retrieving forecast configuration",
    });
  }
};

// Update forecast configuration
const updateForecastConfig = async (req, res) => {
  try {
    const updates = req.body;

    const config = await ForecastConfig.findOneAndUpdate(
      { isActive: true },
      { ...updates, lastUpdated: new Date() },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      data: config,
      message: "Forecast configuration updated successfully",
    });
  } catch (error) {
    console.error("Error updating forecast config:", error);
    res.json({
      success: false,
      message: "Error updating forecast configuration",
    });
  }
};

// Get historical demand data
const getHistoricalData = async (req, res) => {
  try {
    const { foodId } = req.params;
    const { days = 30 } = req.query;

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    const historicalData = await HistoricalDemand.find({
      foodId: foodId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1, hour: 1 });

    res.json({
      success: true,
      data: historicalData,
      message: "Historical data retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting historical data:", error);
    res.json({
      success: false,
      message: "Error retrieving historical data",
    });
  }
};

// Get forecast accuracy metrics
const getForecastAccuracy = async (req, res) => {
  try {
    const { foodId } = req.params;

    // Get forecasts from 24 hours ago
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const forecasts = await DemandForecast.find({
      foodId: foodId,
      forecastDate: { $gte: pastDate, $lte: new Date() },
      status: "active",
    });

    // Get actual historical data for comparison
    const historicalData = await HistoricalDemand.find({
      foodId: foodId,
      date: { $gte: pastDate, $lte: new Date() },
    });

    // Calculate accuracy metrics
    const accuracyData = [];
    let totalError = 0;
    let totalForecasts = 0;

    forecasts.forEach((forecast) => {
      const actual = historicalData.find(
        (h) =>
          h.hour === forecast.forecastHour &&
          Math.abs(h.date.getTime() - forecast.forecastDate.getTime()) <
            60 * 60 * 1000
      );

      if (actual) {
        const error = Math.abs(
          forecast.predictions.pointForecast - actual.totalQuantity
        );
        const accuracy = Math.max(
          0,
          1 - error / Math.max(actual.totalQuantity, 1)
        );

        accuracyData.push({
          hour: forecast.forecastHour,
          forecast: forecast.predictions.pointForecast,
          actual: actual.totalQuantity,
          error: error,
          accuracy: accuracy,
        });

        totalError += error;
        totalForecasts += 1;
      }
    });

    const averageAccuracy =
      totalForecasts > 0
        ? accuracyData.reduce((sum, item) => sum + item.accuracy, 0) /
          accuracyData.length
        : 0;

    const mae = totalForecasts > 0 ? totalError / totalForecasts : 0;

    res.json({
      success: true,
      data: {
        averageAccuracy: averageAccuracy,
        meanAbsoluteError: mae,
        totalForecasts: totalForecasts,
        accuracyDetails: accuracyData,
      },
      message: "Forecast accuracy retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting forecast accuracy:", error);
    res.json({
      success: false,
      message: "Error retrieving forecast accuracy",
    });
  }
};

// Get forecast alerts
const getForecastAlerts = async (req, res) => {
  try {
    const alerts = [];

    // Get all active forecasts
    const forecasts = await DemandForecast.find({ status: "active" });

    // Check for low accuracy
    const lowAccuracyForecasts = forecasts.filter(
      (f) => f.predictions.confidence < 0.7
    );
    if (lowAccuracyForecasts.length > 0) {
      alerts.push({
        type: "low_accuracy",
        severity: "warning",
        message: `${lowAccuracyForecasts.length} forecasts have low accuracy`,
        count: lowAccuracyForecasts.length,
      });
    }

    // Check for high variance
    const highVarianceForecasts = forecasts.filter((f) => {
      const variance =
        (f.predictions.upperBound - f.predictions.lowerBound) /
        f.predictions.pointForecast;
      return variance > 0.5;
    });

    if (highVarianceForecasts.length > 0) {
      alerts.push({
        type: "high_variance",
        severity: "info",
        message: `${highVarianceForecasts.length} forecasts have high variance`,
        count: highVarianceForecasts.length,
      });
    }

    // Check for outdated models
    const outdatedForecasts = forecasts.filter((f) => {
      const hoursSinceTraining =
        (new Date() - f.lastTrained) / (1000 * 60 * 60);
      return hoursSinceTraining > 24;
    });

    if (outdatedForecasts.length > 0) {
      alerts.push({
        type: "outdated_model",
        severity: "warning",
        message: `${outdatedForecasts.length} forecasts need retraining`,
        count: outdatedForecasts.length,
      });
    }

    res.json({
      success: true,
      data: alerts,
      message: "Forecast alerts retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting forecast alerts:", error);
    res.json({
      success: false,
      message: "Error retrieving forecast alerts",
    });
  }
};

export {
  getForecastSummary,
  getFoodForecast,
  generateForecasts,
  getForecastConfig,
  updateForecastConfig,
  getHistoricalData,
  getForecastAccuracy,
  getForecastAlerts,
};

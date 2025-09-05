import express from "express";
import {
  getForecastSummary,
  getFoodForecast,
  generateForecasts,
  getForecastConfig,
  updateForecastConfig,
  getHistoricalData,
  getForecastAccuracy,
  getForecastAlerts,
} from "../controllers/forecastController.js";
import authMiddleware from "../middleware/auth.js";

const forecastRouter = express.Router();

// Forecast summary for admin dashboard
forecastRouter.get("/summary", authMiddleware, getForecastSummary);

// Get forecasts for specific food item
forecastRouter.get("/food/:foodId", authMiddleware, getFoodForecast);

// Generate new forecasts for all food items
forecastRouter.post("/generate", authMiddleware, generateForecasts);

// Forecast configuration management
forecastRouter.get("/config", authMiddleware, getForecastConfig);
forecastRouter.put("/config", authMiddleware, updateForecastConfig);

// Historical data
forecastRouter.get("/historical/:foodId", authMiddleware, getHistoricalData);

// Forecast accuracy metrics
forecastRouter.get("/accuracy/:foodId", authMiddleware, getForecastAccuracy);

// Forecast alerts
forecastRouter.get("/alerts", authMiddleware, getForecastAlerts);

export default forecastRouter;

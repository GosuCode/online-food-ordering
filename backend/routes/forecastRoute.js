import express from "express";
import {
  getForecastSummary,
  getFoodForecast,
  getHistoricalData,
  getAlerts,
  getConfig,
  generateForecasts,
} from "../controllers/forecastController.js";
import authMiddleware from "../middleware/auth.js";

const forecastRouter = express.Router();

// Get forecast summary for all foods
forecastRouter.get("/summary", authMiddleware, getForecastSummary);

// Get detailed forecast for a specific food
forecastRouter.get("/food/:id", authMiddleware, getFoodForecast);

// Get historical data for a food item
forecastRouter.get("/historical/:id", authMiddleware, getHistoricalData);

// Get forecast alerts
forecastRouter.get("/alerts", authMiddleware, getAlerts);

// Get forecast configuration
forecastRouter.get("/config", authMiddleware, getConfig);

// Generate forecasts for all foods
forecastRouter.post("/generate", authMiddleware, generateForecasts);

export default forecastRouter;

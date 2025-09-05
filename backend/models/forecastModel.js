import mongoose from "mongoose";

// Demand forecast schema for storing ARIMA predictions
const demandForecastSchema = new mongoose.Schema({
  // Food item reference
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "food",
    required: true,
  },
  foodName: { type: String, required: true },

  // Time period for forecast
  forecastDate: { type: Date, required: true },
  forecastHour: { type: Number, required: true }, // 0-23

  // ARIMA model parameters
  modelParams: {
    p: { type: Number, required: true }, // AutoRegressive order
    d: { type: Number, required: true }, // Differencing order
    q: { type: Number, required: true }, // Moving Average order
    seasonal: { type: Boolean, default: false },
    seasonalP: { type: Number, default: 0 },
    seasonalD: { type: Number, default: 0 },
    seasonalQ: { type: Number, default: 0 },
    seasonalPeriod: { type: Number, default: 24 }, // 24 hours
  },

  // Forecast data
  predictions: {
    // Point forecast (most likely value)
    pointForecast: { type: Number, required: true },

    // Confidence intervals
    lowerBound: { type: Number, required: true },
    upperBound: { type: Number, required: true },

    // Additional metrics
    confidence: { type: Number, required: true }, // 0-1
    accuracy: { type: Number, default: 0 }, // Historical accuracy
  },

  // External factors
  weatherFactor: { type: Number, default: 1.0 }, // Weather impact multiplier
  dayOfWeek: { type: Number, required: true }, // 0-6 (Sunday = 0)
  isHoliday: { type: Boolean, default: false },
  specialEvent: { type: String, default: null },

  // Model performance
  modelAccuracy: { type: Number, default: 0 },
  lastTrained: { type: Date, default: Date.now },
  trainingDataPoints: { type: Number, default: 0 },

  // Status
  status: {
    type: String,
    enum: ["active", "outdated", "training", "error"],
    default: "active",
  },

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient queries
demandForecastSchema.index({ foodId: 1, forecastDate: 1, forecastHour: 1 });
demandForecastSchema.index({ forecastDate: 1, status: 1 });

// Historical demand data schema
const historicalDemandSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "food",
    required: true,
  },
  foodName: { type: String, required: true },

  // Time period
  date: { type: Date, required: true },
  hour: { type: Number, required: true }, // 0-23
  dayOfWeek: { type: Number, required: true }, // 0-6

  // Demand metrics
  orderCount: { type: Number, required: true },
  totalQuantity: { type: Number, required: true },
  revenue: { type: Number, required: true },

  // External factors
  weather: {
    temperature: { type: Number },
    condition: { type: String },
    humidity: { type: Number },
  },

  // Special events
  isHoliday: { type: Boolean, default: false },
  specialEvent: { type: String, default: null },

  // Calculated features
  demandLevel: {
    type: String,
    enum: ["low", "normal", "high"],
    required: true,
  },

  // Metadata
  createdAt: { type: Date, default: Date.now },
});

// Index for efficient queries
historicalDemandSchema.index({ foodId: 1, date: 1, hour: 1 });
historicalDemandSchema.index({ date: 1, hour: 1 });

// Forecast configuration schema
const forecastConfigSchema = new mongoose.Schema({
  // ARIMA parameters
  defaultParams: {
    p: { type: Number, default: 2 },
    d: { type: Number, default: 1 },
    q: { type: Number, default: 2 },
    seasonal: { type: Boolean, default: true },
    seasonalP: { type: Number, default: 1 },
    seasonalD: { type: Number, default: 1 },
    seasonalQ: { type: Number, default: 1 },
    seasonalPeriod: { type: Number, default: 24 },
  },

  // Training settings
  trainingWindow: { type: Number, default: 30 }, // Days of data to use for training
  minDataPoints: { type: Number, default: 168 }, // Minimum data points (7 days * 24 hours)
  retrainFrequency: { type: Number, default: 7 }, // Retrain every N days

  // Forecast settings
  forecastHorizon: { type: Number, default: 24 }, // Hours ahead to forecast
  confidenceLevel: { type: Number, default: 0.95 }, // 95% confidence interval

  // Weather integration
  weatherEnabled: { type: Boolean, default: true },
  weatherWeight: { type: Number, default: 0.2 }, // Weight of weather in forecast

  // Alert settings
  alerts: {
    lowAccuracy: { type: Number, default: 0.7 }, // Alert if accuracy < 70%
    highVariance: { type: Number, default: 0.3 }, // Alert if variance > 30%
    modelError: { type: Boolean, default: true },
  },

  // Status
  isActive: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
});

// Create models
const DemandForecast =
  mongoose.models.demandForecast ||
  mongoose.model("demandForecast", demandForecastSchema);

const HistoricalDemand =
  mongoose.models.historicalDemand ||
  mongoose.model("historicalDemand", historicalDemandSchema);

const ForecastConfig =
  mongoose.models.forecastConfig ||
  mongoose.model("forecastConfig", forecastConfigSchema);

export { DemandForecast, HistoricalDemand, ForecastConfig };

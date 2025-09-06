import mongoose from "mongoose";

const forecastSchema = new mongoose.Schema({
  foodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Food",
    required: true,
  },
  forecastHour: {
    type: Number,
    required: true,
    min: 0,
    max: 23,
  },
  predictions: {
    pointForecast: {
      type: Number,
      required: true,
      min: 0,
    },
    lowerBound: {
      type: Number,
      required: true,
      min: 0,
    },
    upperBound: {
      type: Number,
      required: true,
      min: 0,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  weatherFactor: {
    type: Number,
    default: 1.0,
  },
  demandLevel: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
forecastSchema.index({ foodId: 1, forecastHour: 1 });

const Forecast = mongoose.model("Forecast", forecastSchema);

export default Forecast;

import mongoose from "mongoose";

const pricingRuleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["demand", "user", "weather", "loyalty"],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, required: true }, // Higher number = higher priority

    // Demand-based pricing
    demandLevel: {
      type: String,
      enum: ["low", "normal", "high"],
      required: false,
    },
    demandDiscount: { type: Number, default: 0 }, // Percentage discount for low demand

    // User-based pricing
    userType: {
      type: String,
      enum: ["new", "loyalty"],
      required: false,
    },
    newUserDiscount: { type: Number, default: 0 },

    // Loyalty tier discounts
    loyaltyTier: {
      type: String,
      enum: ["bronze", "silver", "gold", "platinum"],
      required: false,
    },
    loyaltyDiscount: { type: Number, default: 0 },
    minOrders: { type: Number, default: 0 },
    minSpent: { type: Number, default: 0 },

    // Weather-based pricing
    weatherCondition: {
      type: String,
      enum: ["hot", "cold", "normal"],
      required: false,
    },
    weatherDiscount: { type: Number, default: 0 },
    applicableCategories: [{ type: String }], // Food categories this applies to

    // General settings
    maxDiscount: { type: Number, default: 50 }, // Maximum discount percentage
    minPrice: { type: Number, default: 0 }, // Minimum price after discount
  },
  { timestamps: true }
);

const demandLevelSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["low", "normal", "high"],
      required: true,
    },
    orderThreshold: { type: Number, required: true }, // Orders per hour threshold
    currentOrders: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const weatherDataSchema = new mongoose.Schema(
  {
    city: { type: String, required: true },
    temperature: { type: Number, required: true },
    condition: { type: String, required: true },
    lastUpdated: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true }, // Cache expiration
  },
  { timestamps: true }
);

const pricingRuleModel =
  mongoose.models.pricingRule ||
  mongoose.model("pricingRule", pricingRuleSchema);
const demandLevelModel =
  mongoose.models.demandLevel ||
  mongoose.model("demandLevel", demandLevelSchema);
const weatherDataModel =
  mongoose.models.weatherData ||
  mongoose.model("weatherData", weatherDataSchema);

export { pricingRuleModel, demandLevelModel, weatherDataModel };

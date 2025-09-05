import { demandLevelModel } from "../models/pricingModel.js";
import orderModel from "../models/orderModel.js";

class DemandService {
  constructor() {
    this.updateInterval = 5 * 60 * 1000; // Update every 5 minutes
    this.thresholds = {
      low: 5, // Less than 5 orders per hour
      normal: 15, // 5-15 orders per hour
      high: 15, // More than 15 orders per hour
    };
  }

  async updateDemandLevel() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      // Count orders in the last hour
      const orderCount = await orderModel.countDocuments({
        date: { $gte: oneHourAgo },
      });

      // Determine demand level
      let level = "normal";
      if (orderCount < this.thresholds.low) {
        level = "low";
      } else if (orderCount > this.thresholds.high) {
        level = "high";
      }

      // Update or create demand level record
      await demandLevelModel.findOneAndUpdate(
        {},
        {
          level: level,
          orderThreshold: this.thresholds[level],
          currentOrders: orderCount,
          lastUpdated: new Date(),
        },
        { upsert: true, new: true }
      );

      console.log(
        `\n📊 DEMAND LEVEL UPDATE: ${level.toUpperCase()} (${orderCount} orders in last hour)`
      );
      console.log(
        `   Thresholds: Low < ${this.thresholds.low}, Normal ${this.thresholds.low}-${this.thresholds.high}, High > ${this.thresholds.high}`
      );
      console.log(`   Current Orders: ${orderCount}`);
      console.log(`   Discount Applied: ${level === "low" ? "15%" : "0%"}`);
      return level;
    } catch (error) {
      console.error("Error updating demand level:", error);
      return "normal"; // Default to normal on error
    }
  }

  async getCurrentDemandLevel() {
    try {
      const demandData = await demandLevelModel.findOne({});
      if (demandData) {
        // Check if data is stale (older than 1 hour)
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (demandData.lastUpdated < oneHourAgo) {
          return await this.updateDemandLevel();
        }
        return demandData.level;
      }

      // No data exists, create initial demand level
      return await this.updateDemandLevel();
    } catch (error) {
      console.error("Error getting demand level:", error);
      return "normal";
    }
  }

  async getDemandDiscount() {
    const demandLevel = await this.getCurrentDemandLevel();

    const discounts = {
      low: 15, // 15% discount for low demand
      normal: 0, // No discount for normal demand
      high: 0, // No discount for high demand (as per spec)
    };

    return discounts[demandLevel] || 0;
  }

  // Initialize demand tracking
  async initialize() {
    try {
      await this.updateDemandLevel();

      // Set up periodic updates
      setInterval(() => {
        this.updateDemandLevel();
      }, this.updateInterval);

      console.log("Demand tracking initialized");
    } catch (error) {
      console.error("Error initializing demand tracking:", error);
    }
  }

  // Update thresholds (for admin configuration)
  async updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    await this.updateDemandLevel();
  }
}

export default new DemandService();

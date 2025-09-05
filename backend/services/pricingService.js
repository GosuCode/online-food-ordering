import { pricingRuleModel } from "../models/pricingModel.js";
import userModel from "../models/userModel.js";
import weatherService from "./weatherService.js";
import demandService from "./demandService.js";

class PricingService {
  constructor() {
    this.initializeDefaultRules();
  }

  async initializeDefaultRules() {
    try {
      // Check if rules already exist
      const existingRules = await pricingRuleModel.countDocuments();
      if (existingRules > 0) return;

      // Create default pricing rules
      const defaultRules = [
        // Loyalty discounts (Priority 4 - highest)
        {
          name: "Loyalty Bronze (5+ orders or $100+)",
          type: "loyalty",
          priority: 4,
          loyaltyTier: "bronze",
          loyaltyDiscount: 5,
          minOrders: 5,
          minSpent: 100,
        },
        {
          name: "Loyalty Silver (10+ orders or $300+)",
          type: "loyalty",
          priority: 4,
          loyaltyTier: "silver",
          loyaltyDiscount: 7,
          minOrders: 10,
          minSpent: 300,
        },
        {
          name: "Loyalty Gold (20+ orders or $500+)",
          type: "loyalty",
          priority: 4,
          loyaltyTier: "gold",
          loyaltyDiscount: 10,
          minOrders: 20,
          minSpent: 500,
        },
        {
          name: "Loyalty Platinum (50+ orders or $1000+)",
          type: "loyalty",
          priority: 4,
          loyaltyTier: "platinum",
          loyaltyDiscount: 15,
          minOrders: 50,
          minSpent: 1000,
        },

        // New user discount (Priority 3)
        {
          name: "New User Discount",
          type: "user",
          priority: 3,
          userType: "new",
          newUserDiscount: 10,
        },

        // Weather discounts (Priority 2)
        {
          name: "Cold Weather Soup Discount",
          type: "weather",
          priority: 2,
          weatherCondition: "cold",
          weatherDiscount: 15,
          applicableCategories: ["soup", "hot_drinks"],
        },
        {
          name: "Hot Weather Cold Drinks Discount",
          type: "weather",
          priority: 2,
          weatherCondition: "hot",
          weatherDiscount: 10,
          applicableCategories: ["cold_drinks", "ice_cream", "salad"],
        },

        // Demand discounts (Priority 1 - lowest)
        {
          name: "Low Demand Discount",
          type: "demand",
          priority: 1,
          demandLevel: "low",
          demandDiscount: 15,
        },
      ];

      await pricingRuleModel.insertMany(defaultRules);
      console.log("\n🎯 DYNAMIC PRICING SYSTEM INITIALIZED");
      console.log("📋 Default Pricing Rules Created:");
      defaultRules.forEach((rule, index) => {
        console.log(
          `   ${index + 1}. ${rule.name} (${rule.type}, Priority: ${
            rule.priority
          })`
        );
      });
      console.log("\n🚀 System ready to apply dynamic pricing!");
    } catch (error) {
      console.error("Error initializing default pricing rules:", error);
    }
  }

  async calculateDynamicPrice(foodItem, userId, userCity) {
    try {
      const basePrice = foodItem.price;
      const applicableDiscounts = [];

      // Get user data
      const user = await userModel.findById(userId);
      if (!user) {
        console.log(`❌ User not found: ${userId}`);
        return {
          originalPrice: basePrice,
          finalPrice: basePrice,
          discount: 0,
          appliedRule: null,
        };
      }

      // Get current demand level
      const demandLevel = await demandService.getCurrentDemandLevel();
      const demandDiscount = await demandService.getDemandDiscount();

      // Get weather data
      const weatherData = await weatherService.getWeatherData(userCity);
      const weatherDiscount = weatherService.getWeatherDiscount(
        weatherData.condition,
        foodItem.category
      );

      // Calculate loyalty discount
      const loyaltyDiscount = this.calculateLoyaltyDiscount(user);

      // Check for new user discount
      const newUserDiscount = user.isNewUser ? 10 : 0;

      // Collect all applicable discounts with their priorities
      if (loyaltyDiscount > 0) {
        applicableDiscounts.push({
          type: "loyalty",
          discount: loyaltyDiscount,
          priority: 4,
          rule: `Loyalty ${user.loyaltyTier} discount`,
        });
      }

      if (newUserDiscount > 0) {
        applicableDiscounts.push({
          type: "new_user",
          discount: newUserDiscount,
          priority: 3,
          rule: "New user discount",
        });
      }

      if (weatherDiscount > 0) {
        applicableDiscounts.push({
          type: "weather",
          discount: weatherDiscount,
          priority: 2,
          rule: `${weatherData.condition} weather discount`,
        });
      }

      if (demandDiscount > 0) {
        applicableDiscounts.push({
          type: "demand",
          discount: demandDiscount,
          priority: 1,
          rule: "Low demand discount",
        });
      }

      // Apply the highest priority discount only
      const bestDiscount =
        applicableDiscounts.length > 0
          ? applicableDiscounts.sort((a, b) => b.priority - a.priority)[0]
          : null;

      const discountAmount = bestDiscount ? bestDiscount.discount : 0;
      const finalPrice = Math.max(
        basePrice * (1 - discountAmount / 100),
        basePrice * 0.1 // Minimum 10% of original price
      );

      // Console log discount information
      console.log(`\n🎯 DISCOUNT CALCULATION for ${foodItem.name}:`);
      console.log(`   Base Price: Rs. ${basePrice}`);
      console.log(
        `   User: ${user.name} (${user.loyaltyTier} tier, ${user.orderCount} orders, $${user.totalSpent} spent)`
      );
      console.log(
        `   Weather: ${weatherData.condition} (${weatherData.temperature}°C)`
      );
      console.log(`   Demand Level: ${demandLevel}`);
      console.log(`   Available Discounts:`, applicableDiscounts);
      console.log(
        `   Applied Discount: ${
          bestDiscount
            ? `${bestDiscount.rule} (${bestDiscount.discount}%)`
            : "None"
        }`
      );
      console.log(`   Final Price: Rs. ${Math.round(finalPrice * 100) / 100}`);
      console.log(
        `   Savings: Rs. ${(
          basePrice -
          Math.round(finalPrice * 100) / 100
        ).toFixed(2)}`
      );

      return {
        originalPrice: basePrice,
        finalPrice: Math.round(finalPrice * 100) / 100,
        discount: discountAmount,
        appliedRule: bestDiscount ? bestDiscount.rule : null,
        discountType: bestDiscount ? bestDiscount.type : null,
      };
    } catch (error) {
      console.error("Error calculating dynamic price:", error);
      return {
        originalPrice: foodItem.price,
        finalPrice: foodItem.price,
        discount: 0,
        appliedRule: null,
      };
    }
  }

  calculateLoyaltyDiscount(user) {
    const { orderCount, totalSpent, loyaltyTier } = user;

    // Check loyalty tier requirements
    if (
      loyaltyTier === "platinum" &&
      (orderCount >= 50 || totalSpent >= 1000)
    ) {
      return 15;
    }
    if (loyaltyTier === "gold" && (orderCount >= 20 || totalSpent >= 500)) {
      return 10;
    }
    if (loyaltyTier === "silver" && (orderCount >= 10 || totalSpent >= 300)) {
      return 7;
    }
    if (loyaltyTier === "bronze" && (orderCount >= 5 || totalSpent >= 100)) {
      return 5;
    }

    return 0;
  }

  async updateUserLoyaltyTier(userId) {
    try {
      const user = await userModel.findById(userId);
      if (!user) return;

      const { orderCount, totalSpent } = user;
      let newTier = "bronze";

      if (orderCount >= 50 || totalSpent >= 1000) {
        newTier = "platinum";
      } else if (orderCount >= 20 || totalSpent >= 500) {
        newTier = "gold";
      } else if (orderCount >= 10 || totalSpent >= 300) {
        newTier = "silver";
      }

      if (newTier !== user.loyaltyTier) {
        await userModel.findByIdAndUpdate(userId, { loyaltyTier: newTier });
        console.log(`User ${userId} loyalty tier updated to ${newTier}`);
      }
    } catch (error) {
      console.error("Error updating user loyalty tier:", error);
    }
  }

  async updateUserStats(userId, orderAmount) {
    try {
      await userModel.findByIdAndUpdate(userId, {
        $inc: {
          orderCount: 1,
          totalSpent: orderAmount,
        },
        $set: { isNewUser: false },
      });

      // Update loyalty tier
      await this.updateUserLoyaltyTier(userId);
    } catch (error) {
      console.error("Error updating user stats:", error);
    }
  }

  async getPricingRules() {
    try {
      return await pricingRuleModel
        .find({ isActive: true })
        .sort({ priority: -1 });
    } catch (error) {
      console.error("Error getting pricing rules:", error);
      return [];
    }
  }

  async updatePricingRule(ruleId, updates) {
    try {
      return await pricingRuleModel.findByIdAndUpdate(ruleId, updates, {
        new: true,
      });
    } catch (error) {
      console.error("Error updating pricing rule:", error);
      throw error;
    }
  }

  async createPricingRule(ruleData) {
    try {
      const rule = new pricingRuleModel(ruleData);
      return await rule.save();
    } catch (error) {
      console.error("Error creating pricing rule:", error);
      throw error;
    }
  }
}

export default new PricingService();

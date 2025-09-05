import foodModel from "../models/foodModel.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import pricingService from "../services/pricingService.js";
import fs from "fs";

// add food items

const addFood = async (req, res) => {
  let image_filename = `${req.file.filename}`;
  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    image: image_filename,
  });
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await food.save();
      res.json({ success: true, message: "Food Added" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// all foods with dynamic pricing
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    const userId = req.query.userId;
    const userCity = req.query.city || "Kathmandu"; // Default city

    if (userId) {
      // Apply dynamic pricing for authenticated users
      const foodsWithPricing = await Promise.all(
        foods.map(async (food) => {
          const pricing = await pricingService.calculateDynamicPrice(
            food,
            userId,
            userCity
          );
          return {
            ...food.toObject(),
            originalPrice: pricing.originalPrice,
            price: pricing.finalPrice,
            discount: pricing.discount,
            appliedRule: pricing.appliedRule,
            discountType: pricing.discountType,
          };
        })
      );
      res.json({ success: true, data: foodsWithPricing });
    } else {
      // Return original prices for non-authenticated users
      res.json({ success: true, data: foods });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// get single food item with dynamic pricing
const getFoodById = async (req, res) => {
  try {
    const food = await foodModel.findById(req.params.id);
    if (food) {
      const userId = req.query.userId;
      const userCity = req.query.city || "Kathmandu";

      if (userId) {
        // Apply dynamic pricing for authenticated users
        const pricing = await pricingService.calculateDynamicPrice(
          food,
          userId,
          userCity
        );
        const foodWithPricing = {
          ...food.toObject(),
          originalPrice: pricing.originalPrice,
          price: pricing.finalPrice,
          discount: pricing.discount,
          appliedRule: pricing.appliedRule,
          discountType: pricing.discountType,
        };
        res.json({ success: true, data: foodWithPricing });
      } else {
        res.json({ success: true, data: food });
      }
    } else {
      res.json({ success: false, message: "Food item not found" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// remove food item
const removeFood = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const food = await foodModel.findById(req.body.id);
      fs.unlink(`uploads/${food.image}`, () => {});
      await foodModel.findByIdAndDelete(req.body.id);
      res.json({ success: true, message: "Food Removed" });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// get food recommendations for user
const getRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get user's order history
    const userOrders = await orderModel.find({
      userId: userId,
      rating: { $exists: true, $ne: null },
    });

    // Get all food items
    const allFoods = await foodModel.find({});

    if (userOrders.length === 0) {
      // New user - return popular items (highest rated)
      const popularItems = allFoods
        .filter((food) => food.totalRatings > 0)
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 10);

      return res.json({ success: true, data: popularItems });
    }

    // Get user's rated food items
    const userRatedItems = new Set();
    const userPreferences = {};

    userOrders.forEach((order) => {
      order.items.forEach((item) => {
        userRatedItems.add(item._id.toString());
        if (!userPreferences[item.category]) {
          userPreferences[item.category] = { totalRating: 0, count: 0 };
        }
        userPreferences[item.category].totalRating += order.rating;
        userPreferences[item.category].count += 1;
      });
    });

    // Calculate user's category preferences
    const categoryPreferences = {};
    Object.keys(userPreferences).forEach((category) => {
      categoryPreferences[category] =
        userPreferences[category].totalRating / userPreferences[category].count;
    });

    // Find similar users (collaborative filtering)
    const similarUsers = await findSimilarUsers(userId, userRatedItems);

    // Generate recommendations
    const recommendations = generateRecommendations(
      allFoods,
      userRatedItems,
      categoryPreferences,
      similarUsers
    );

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error getting recommendations" });
  }
};

// Find users with similar preferences
const findSimilarUsers = async (currentUserId, userRatedItems) => {
  try {
    // Get all other users' orders
    const otherUsersOrders = await orderModel.find({
      userId: { $ne: currentUserId },
      rating: { $exists: true, $ne: null },
    });

    const userSimilarities = {};

    // Group orders by user
    const userOrders = {};
    otherUsersOrders.forEach((order) => {
      if (!userOrders[order.userId]) {
        userOrders[order.userId] = [];
      }
      userOrders[order.userId].push(order);
    });

    // Calculate similarity with each user
    Object.keys(userOrders).forEach((userId) => {
      const similarity = calculateUserSimilarity(
        userRatedItems,
        userOrders[userId]
      );
      if (similarity > 0) {
        userSimilarities[userId] = similarity;
      }
    });

    // Return top 5 similar users
    return Object.entries(userSimilarities)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([userId, similarity]) => ({ userId, similarity }));
  } catch (error) {
    console.log("Error finding similar users:", error);
    return [];
  }
};

// Calculate similarity between users based on common rated items
const calculateUserSimilarity = (userRatedItems, otherUserOrders) => {
  const otherUserRatedItems = new Set();
  const commonItems = new Set();

  otherUserOrders.forEach((order) => {
    order.items.forEach((item) => {
      otherUserRatedItems.add(item._id.toString());
      if (userRatedItems.has(item._id.toString())) {
        commonItems.add(item._id.toString());
      }
    });
  });

  if (commonItems.size === 0) return 0;

  // Jaccard similarity coefficient
  const union = new Set([...userRatedItems, ...otherUserRatedItems]);
  return commonItems.size / union.size;
};

// Generate recommendations based on multiple factors
const generateRecommendations = (
  allFoods,
  userRatedItems,
  categoryPreferences,
  similarUsers
) => {
  const recommendations = [];

  allFoods.forEach((food) => {
    // Skip items user has already rated
    if (userRatedItems.has(food._id.toString())) return;

    let score = 0;

    // Factor 1: Category preference (40% weight)
    if (categoryPreferences[food.category]) {
      score += categoryPreferences[food.category] * 0.4;
    }

    // Factor 2: Overall rating (30% weight)
    if (food.averageRating > 0) {
      score += food.averageRating * 0.3;
    }

    // Factor 3: Popularity (number of ratings) (20% weight)
    const popularityScore = Math.min(food.totalRatings / 10, 1); // Normalize to 0-1
    score += popularityScore * 0.2;

    // Factor 4: Similar users' preferences (10% weight)
    // This would require more complex implementation with user-item matrix
    // For now, we'll use a simple boost for highly rated items
    if (food.averageRating >= 4.0) {
      score += 0.1;
    }

    recommendations.push({
      ...food.toObject(),
      recommendationScore: score,
    });
  });

  // Sort by recommendation score and return top 10
  return recommendations
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 10);
};

// get pricing rules (admin only)
const getPricingRules = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const rules = await pricingService.getPricingRules();
      res.json({ success: true, data: rules });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// update pricing rule (admin only)
const updatePricingRule = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const rule = await pricingService.updatePricingRule(
        req.params.ruleId,
        req.body
      );
      res.json({ success: true, data: rule });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// create pricing rule (admin only)
const createPricingRule = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const rule = await pricingService.createPricingRule(req.body);
      res.json({ success: true, data: rule });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Test endpoint to verify pricing
const testPricing = async (req, res) => {
  try {
    const { userId, foodId } = req.query;

    if (!userId || !foodId) {
      return res.json({
        success: false,
        message: "userId and foodId required",
      });
    }

    const food = await foodModel.findById(foodId);
    const user = await userModel.findById(userId);

    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    console.log("🧪 TEST PRICING:");
    console.log("   Food:", food.name, "Price:", food.price);
    console.log("   User:", user.name, "City:", user.city);

    const pricing = await pricingService.calculateDynamicPrice(
      food,
      userId,
      user.city || "Kathmandu"
    );

    console.log("   Pricing result:", pricing);

    res.json({
      success: true,
      data: {
        food: food,
        user: user,
        pricing: pricing,
      },
    });
  } catch (error) {
    console.error("Test pricing error:", error);
    res.json({ success: false, message: "Error" });
  }
};

export {
  addFood,
  listFood,
  getFoodById,
  removeFood,
  getRecommendations,
  getPricingRules,
  updatePricingRule,
  createPricingRule,
  testPricing,
};

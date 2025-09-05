import mongoose from "mongoose";
import dotenv from "dotenv";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    console.log(
      "Please make sure MongoDB is running and update the connection string"
    );
    process.exit(1);
  }
};

// Function to recalculate ratings for all food items
const recalculateRatings = async () => {
  try {
    console.log("Starting rating recalculation...");

    // Get all food items
    const foods = await foodModel.find({});
    console.log(`Found ${foods.length} food items`);

    for (const food of foods) {
      // Get all orders that contain this food item and have ratings
      const orders = await orderModel.find({
        "items._id": food._id.toString(),
        rating: { $exists: true, $ne: null },
      });

      if (orders.length === 0) {
        console.log(
          `No ratings found for ${food.name}, setting default values`
        );
        await foodModel.findByIdAndUpdate(food._id, {
          averageRating: 0,
          totalRatings: 0,
        });
        continue;
      }

      // Calculate average rating
      let totalRating = 0;
      let ratingCount = 0;

      for (const order of orders) {
        // Count how many times this food item appears in the order
        const itemInOrder = order.items.find(
          (item) => item._id === food._id.toString()
        );
        if (itemInOrder) {
          totalRating += order.rating * itemInOrder.quantity;
          ratingCount += itemInOrder.quantity;
        }
      }

      const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

      // Update food item with calculated ratings
      await foodModel.findByIdAndUpdate(food._id, {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalRatings: ratingCount,
      });

      console.log(
        `Updated ${food.name}: ${averageRating.toFixed(
          1
        )}/5 (${ratingCount} ratings)`
      );
    }

    console.log("Rating recalculation completed!");
  } catch (error) {
    console.error("Error recalculating ratings:", error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await recalculateRatings();
  await mongoose.connection.close();
  console.log("Migration completed and connection closed");
};

// Run the migration
main().catch(console.error);

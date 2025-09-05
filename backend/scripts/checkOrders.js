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
    process.exit(1);
  }
};

const checkOrders = async () => {
  try {
    console.log("Checking orders and ratings...");

    // Get all orders
    const orders = await orderModel.find({});
    console.log(`\nTotal orders: ${orders.length}`);

    if (orders.length > 0) {
      console.log("\nFirst order structure:");
      console.log(JSON.stringify(orders[0], null, 2));

      // Check for orders with ratings
      const ratedOrders = await orderModel.find({
        rating: { $exists: true, $ne: null },
      });
      console.log(`\nOrders with ratings: ${ratedOrders.length}`);

      if (ratedOrders.length > 0) {
        console.log("\nFirst rated order:");
        console.log(JSON.stringify(ratedOrders[0], null, 2));
      }
    }

    // Get all food items
    const foods = await foodModel.find({});
    console.log(`\nTotal food items: ${foods.length}`);

    if (foods.length > 0) {
      console.log("\nFirst food item:");
      console.log(JSON.stringify(foods[0], null, 2));
    }
  } catch (error) {
    console.error("Error checking orders:", error);
  }
};

const main = async () => {
  await connectDB();
  await checkOrders();
  await mongoose.connection.close();
  console.log("\nCheck completed and connection closed");
};

main().catch(console.error);

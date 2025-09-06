import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import foodModel from "../models/foodModel.js";
import pricingService from "../services/pricingService.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc Place new order, clear user's cart, and initiate Stripe checkout session
 * @param {object} req - The request object containing order details and user ID.
 * @param {object} res - The response object to send back the session URL or error.
 * @returns {object} JSON response with success status and Stripe session URL or an error message.
 *
 */

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173"; // frontend client url
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // Update user loyalty stats
    await pricingService.updateUserStats(req.body.userId, req.body.amount);

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success == "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Listing orders for admin pannel
const listOrders = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({}).populate("userId", "name email");
      res.json({ success: true, data: orders });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for updating status
const updateStatus = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      await orderModel.findByIdAndUpdate(req.body.orderId, {
        status: req.body.status,
      });
      res.json({ success: true, message: "Status Updated Successfully" });
    } else {
      res.json({ success: false, message: "You are not an admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for deleting order
const deleteOrder = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orderId = req.params.orderId;
      const order = await orderModel.findById(orderId);

      if (!order) {
        return res.json({ success: false, message: "Order not found" });
      }

      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: true, message: "Order deleted successfully" });
    } else {
      res.json({ success: false, message: "You are not an admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error deleting order" });
  }
};

// submit rating and review for order
const submitRating = async (req, res) => {
  try {
    const { orderId, rating, review } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Update order with rating and review
    const order = await orderModel.findByIdAndUpdate(
      orderId,
      { rating, review },
      { new: true }
    );

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    // Update food item ratings
    for (const item of order.items) {
      const food = await foodModel.findById(item._id);
      if (food) {
        // Add rating for each quantity of the item
        const quantity = item.quantity || 1;
        const newTotalRatings = food.totalRatings + quantity;
        const newAverageRating =
          (food.averageRating * food.totalRatings + rating * quantity) /
          newTotalRatings;

        await foodModel.findByIdAndUpdate(item._id, {
          averageRating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal
          totalRatings: newTotalRatings,
        });
      }
    }

    res.json({ success: true, message: "Rating submitted successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error submitting rating" });
  }
};

export {
  placeOrder,
  verifyOrder,
  userOrders,
  listOrders,
  updateStatus,
  deleteOrder,
  submitRating,
};

import express from "express";
import {
  addFood,
  listFood,
  getFoodById,
  removeFood,
  getRecommendations,
  getPricingRules,
  updatePricingRule,
  createPricingRule,
  testPricing,
  getCategories,
} from "../controllers/foodController.js";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";

const foodRouter = express.Router();

// Image Storage Engine

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

foodRouter.post("/add", upload.single("image"), authMiddleware, addFood);
foodRouter.get("/list", listFood);
foodRouter.get("/categories", getCategories);
foodRouter.get("/recommendations/:userId", authMiddleware, getRecommendations);
foodRouter.get("/:id", getFoodById);
foodRouter.post("/remove", authMiddleware, removeFood);

// Pricing management routes (admin only)
foodRouter.get("/pricing/rules", authMiddleware, getPricingRules);
foodRouter.put("/pricing/rules/:ruleId", authMiddleware, updatePricingRule);
foodRouter.post("/pricing/rules", authMiddleware, createPricingRule);

// Test pricing endpoint
foodRouter.get("/test-pricing", testPricing);

export default foodRouter;

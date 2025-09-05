import express from "express";
import {
  loginUser,
  registerUser,
  getUserData,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/userData", authMiddleware, getUserData);

export default userRouter;

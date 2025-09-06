import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUrl = process.env.MONGO_URL;
  await mongoose
    .connect(mongoUrl)
    .then(() => console.log("DB Connected successfully!"));
};

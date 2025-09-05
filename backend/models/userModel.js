import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z\s]+$/.test(v);
        },
        message: "Name cannot contain numbers",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(v);
        },
        message: "Email must be a Gmail address",
      },
    },
    password: { type: String, required: true },
    city: { type: String, required: true },
    street: { type: String, required: true },
    state: {
      type: String,
      required: true,
      enum: [
        "Province 1",
        "Madhesh Province",
        "Bagmati Province",
        "Gandaki Province",
        "Lumbini Province",
        "Karnali Province",
        "Sudurpashchim Province",
      ],
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Phone number must be exactly 10 digits",
      },
    },
    role: { type: String, default: "user" },
    cartData: { type: Object, default: {} },
  },
  { minimize: false },
  { timestamps: true }
);

const userModel = mongoose.model.user || mongoose.model("user", userSchema);
export default userModel;

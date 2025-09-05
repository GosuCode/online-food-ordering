import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// login user

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User Doesn't exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    const role = user.role;
    const token = createToken(user._id);
    res.json({ success: true, token, role });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Create token

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// register user

const registerUser = async (req, res) => {
  const { name, email, password, city, street, state, phone } = req.body;
  try {
    if (!name || !email || !password || !city || !street || !state || !phone) {
      return res.json({ success: false, message: "All fields are required" });
    }

    // checking user is already exist
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format (Gmail only)
    if (!validator.isEmail(email) || !email.endsWith("@gmail.com")) {
      return res.json({
        success: false,
        message: "Please enter a valid Gmail address",
      });
    }

    // validating name (no numbers)
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return res.json({
        success: false,
        message: "Name cannot contain numbers",
      });
    }

    // validating password strength
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter strong password (minimum 8 characters)",
      });
    }

    // validating phone number (10 digits)
    if (!/^[0-9]{10}$/.test(phone)) {
      return res.json({
        success: false,
        message: "Phone number must be exactly 10 digits",
      });
    }

    // validating Nepal states
    const nepalStates = [
      "Province 1",
      "Madhesh Province",
      "Bagmati Province",
      "Gandaki Province",
      "Lumbini Province",
      "Karnali Province",
      "Sudurpashchim Province",
    ];
    if (!nepalStates.includes(state)) {
      return res.json({
        success: false,
        message: "Please select a valid Nepal state",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
      city: city,
      street: street,
      state: state,
      phone: phone,
    });

    const user = await newUser.save();
    const role = user.role;
    const token = createToken(user._id);
    res.json({ success: true, token, role });
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.json({ success: false, message: errors.join(", ") });
    }
    res.json({ success: false, message: "Error" });
  }
};

// get user data
const getUserData = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { loginUser, registerUser, getUserData };

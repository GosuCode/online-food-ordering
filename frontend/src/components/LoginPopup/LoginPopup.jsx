import { useContext, useState } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken } = useContext(StoreContext);
  const [currentState, setCurrentState] = useState("Login");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    street: "",
    state: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((data) => ({ ...data, [name]: value }));
  };

  const validateForm = () => {
    if (currentState === "Sign Up") {
      if (
        !data.name ||
        !data.email ||
        !data.password ||
        !data.city ||
        !data.street ||
        !data.state ||
        !data.phone
      ) {
        toast.error("All fields are required");
        return false;
      }
      if (!/^[a-zA-Z\s]+$/.test(data.name)) {
        toast.error("Name cannot contain numbers");
        return false;
      }
      if (!data.email.endsWith("@gmail.com")) {
        toast.error("Please enter a valid Gmail address");
        return false;
      }
      if (data.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return false;
      }
      if (!/^[0-9]{10}$/.test(data.phone)) {
        toast.error("Phone number must be exactly 10 digits");
        return false;
      }
    }
    return true;
  };

  const onLogin = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    let newUrl = url;
    if (currentState === "Login") {
      newUrl += "/api/user/login";
    } else {
      newUrl += "/api/user/register";
    }
    const response = await axios.post(newUrl, data);
    if (response.data.success) {
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      toast.success(
        currentState === "Login"
          ? "Login Successfully"
          : "Account Created Successfully"
      );
      setShowLogin(false);
    } else {
      toast.error(response.data.message);
    }
  };
  return (
    <div className="login-popup">
      <form onSubmit={onLogin} className="login-popup-container">
        <div className="login-popup-title">
          <h2>{currentState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>
        <div className="login-popup-inputs">
          {currentState === "Login" ? (
            <></>
          ) : (
            <>
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder="Full Name"
                required
              />
              <select
                name="state"
                onChange={onChangeHandler}
                value={data.state}
                required
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">Select State</option>
                <option value="Province 1">Province 1</option>
                <option value="Madhesh Province">Madhesh Province</option>
                <option value="Bagmati Province">Bagmati Province</option>
                <option value="Gandaki Province">Gandaki Province</option>
                <option value="Lumbini Province">Lumbini Province</option>
                <option value="Karnali Province">Karnali Province</option>
                <option value="Sudurpashchim Province">
                  Sudurpashchim Province
                </option>
              </select>
              <input
                name="city"
                onChange={onChangeHandler}
                value={data.city}
                type="text"
                placeholder="City"
                required
              />
              <input
                name="street"
                onChange={onChangeHandler}
                value={data.street}
                type="text"
                placeholder="Street address"
                required
              />
              <input
                name="phone"
                onChange={onChangeHandler}
                value={data.phone}
                type="tel"
                placeholder="Phone number"
                required
                pattern="[0-9]{10}"
              />
            </>
          )}
          <input
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email"
            placeholder="Gmail address"
            required
          />
          <input
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password"
            placeholder="Password (min 8 characters)"
            required
          />
        </div>
        <button type="submit">
          {currentState === "Sign Up" ? "Create Account" : "Login"}
        </button>
        {currentState === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setCurrentState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => setCurrentState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;

LoginPopup.propTypes = {
  setShowLogin: PropTypes.func.isRequired,
};

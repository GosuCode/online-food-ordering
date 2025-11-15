import { useContext, useEffect, useState } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const PlaceOrder = () => {
  const navigate = useNavigate();

  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItems,
    url,
    userData,
    setCartItems,
    loadCardData,
  } = useContext(StoreContext);
  const [data, setData] = useState({
    name: "",
    email: "",
    street: "",
    city: "",
    state: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  // Nepal states/provinces
  const nepalStates = [
    "Province 1",
    "Madhesh Province",
    "Bagmati Province",
    "Gandaki Province",
    "Lumbini Province",
    "Karnali Province",
    "Sudurpashchim Province",
  ];

  // Validation functions
  const validateName = (name) => {
    return /^[a-zA-Z\s]+$/.test(name);
  };

  const validateEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
  };

  const validatePhone = (phone) => {
    return /^[0-9]{10}$/.test(phone);
  };

  const validateCity = (city) => {
    return /^[a-zA-Z\s]+$/.test(city);
  };

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    // Apply validation based on field type
    if (name === "name" && value && !validateName(value)) {
      toast.error("Name should contain only letters and spaces");
      return;
    }

    if (name === "email" && value && !validateEmail(value)) {
      toast.error("Please enter a valid Gmail address");
      return;
    }

    if (name === "phone" && value && !validatePhone(value)) {
      toast.error("Phone number must contain exactly 10 digits");
      return;
    }

    if (name === "city" && value && !validateCity(value)) {
      toast.error("City should contain only letters and spaces");
      return;
    }

    setData((data) => ({ ...data, [name]: value }));
  };

  const placeOrder = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (getTotalCartAmount() === 0) {
      toast.error("Your cart is empty!");
      navigate("/cart");
      return;
    }

    setLoading(true);
    if (!validateName(data.name)) {
      toast.error("Name should contain only letters and spaces");
      setLoading(false);
      return;
    }

    if (!validateEmail(data.email)) {
      toast.error("Please enter a valid Gmail address");
      setLoading(false);
      return;
    }

    if (!validatePhone(data.phone)) {
      toast.error("Phone number must contain exactly 10 digits");
      setLoading(false);
      return;
    }

    if (!validateCity(data.city)) {
      toast.error("City should contain only letters and spaces");
      setLoading(false);
      return;
    }

    if (!data.state) {
      toast.error("Please select a state");
      setLoading(false);
      return;
    }

    if (!data.street.trim()) {
      toast.error("Please enter street address");
      setLoading(false);
      return;
    }

    let orderItems = [];
    food_list.forEach((item) => {
      if (cartItems && cartItems[item._id] > 0) {
        let itemInfo = { ...item };
        itemInfo.quantity = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    if (orderItems.length === 0) {
      toast.error("Your cart is empty!");
      setLoading(false);
      navigate("/cart");
      return;
    }

    // Only send the specified data fields
    const addressData = {
      name: data.name,
      email: data.email,
      street: data.street,
      city: data.city,
      state: data.state,
      phone: data.phone,
    };

    const deliveryFee = getTotalCartAmount() === 0 ? 0 : 10;
    const totalAmount = getTotalCartAmount() + deliveryFee;

    let orderData = {
      address: addressData,
      items: orderItems,
      amount: totalAmount,
    };

    try {
      let response = await axios.post(url + "/api/order/place", orderData, {
        headers: { token },
      });
      if (response.data.success) {
        setCartItems({});
        if (token) {
          await loadCardData(token);
        }
        const { orderId } = response.data;
        navigate(`/order-confirmation?orderId=${orderId}`);
      } else {
        toast.error(response.data.message || "Error placing order!");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error(
        error.response?.data?.message ||
          "Error placing order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please Login first");
      navigate("/cart");
    } else if (getTotalCartAmount() === 0) {
      toast.error("Please Add Items to Cart");
      navigate("/cart");
    }
  }, [token, getTotalCartAmount, navigate]);

  useEffect(() => {
    if (userData) {
      setData((prevData) => ({
        ...prevData,
        name: userData.name || "",
        email: userData.email || "",
        city: userData.city || "",
        street: userData.street || "",
        state: userData.state || "",
        phone: userData.phone || "",
      }));
    }
  }, [userData]);

  console.log(userData);
  return (
    <form className="place-order" onSubmit={placeOrder}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>

        <input
          required
          name="name"
          value={data.name}
          onChange={onChangeHandler}
          type="text"
          placeholder="Full Name"
          pattern="[a-zA-Z\s]+"
          title="Name should contain only letters and spaces"
        />

        <input
          required
          name="email"
          value={data.email}
          onChange={onChangeHandler}
          type="email"
          placeholder="Gmail Address (e.g., user@gmail.com)"
          title="Please enter a valid Gmail address"
        />

        <input
          required
          name="street"
          value={data.street}
          onChange={onChangeHandler}
          type="text"
          placeholder="Street Address"
        />

        <div className="multi-fields">
          <input
            required
            name="city"
            value={data.city}
            onChange={onChangeHandler}
            type="text"
            placeholder="City"
            pattern="[a-zA-Z\s]+"
            title="City should contain only letters and spaces"
          />
          <select
            required
            name="state"
            value={data.state}
            onChange={onChangeHandler}
            className="state-select"
          >
            <option value="">Select State</option>
            {nepalStates.map((state, index) => (
              <option key={index} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        <input
          required
          name="phone"
          value={data.phone}
          onChange={onChangeHandler}
          type="tel"
          placeholder="Phone Number (10 digits)"
          pattern="[0-9]{10}"
          title="Phone number must contain exactly 10 digits"
          maxLength="10"
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotals</p>
              <p>Rs.{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>Rs. {getTotalCartAmount() === 0 ? 0 : 10}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                Rs. {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 10}
              </b>
            </div>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "PLACING ORDER..." : "PLACE ORDER"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;

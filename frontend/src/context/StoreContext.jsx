import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [userData, setUserData] = useState(null);

  const addToCart = async (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
    if (token) {
      const response = await axios.post(
        url + "/api/cart/add",
        { itemId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("item Added to Cart");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (token) {
      const response = await axios.post(
        url + "/api/cart/remove",
        { itemId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("item Removed from Cart");
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo && itemInfo.price) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    try {
      let apiUrl = url + "/api/food/list";

      // Add user ID and city to the request if user is logged in
      if (token && userData) {
        const params = new URLSearchParams({
          userId: userData._id,
          city: userData.city || "Kathmandu",
        });
        apiUrl += `?${params.toString()}`;
      }

      const response = await axios.get(apiUrl);
      if (response.data.success && response.data.data) {
        // Console log discount information for each food item
        console.log("\n🛒 FOOD LIST WITH DISCOUNTS:");
        response.data.data.forEach((item, index) => {
          if (item.discount > 0) {
            console.log(`\n${index + 1}. ${item.name}:`);
            console.log(`   Original Price: Rs. ${item.originalPrice}`);
            console.log(`   Discounted Price: Rs. ${item.price}`);
            console.log(`   Discount: ${item.discount}%`);
            console.log(`   Applied Rule: ${item.appliedRule}`);
            console.log(
              `   Savings: Rs. ${(item.originalPrice - item.price).toFixed(2)}`
            );
          } else {
            console.log(
              `\n${index + 1}. ${item.name}: Rs. ${item.price} (No discount)`
            );
          }
        });

        setFoodList(response.data.data);
      } else {
        console.error("Error fetching food list:", response.data);
        setFoodList([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      setFoodList([]); // Set empty array as fallback
    }
  };

  const loadCardData = async (token) => {
    const response = await axios.post(
      url + "/api/cart/get",
      {},
      { headers: { token } }
    );
    setCartItems(response.data.cartData);
  };

  const fetchUserData = async (token) => {
    try {
      const response = await axios.post(
        url + "/api/user/userData",
        {},
        {
          headers: { token },
        }
      );
      if (response.data.success) {
        setUserData(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    async function loadData() {
      if (localStorage.getItem("token")) {
        const token = localStorage.getItem("token");
        setToken(token);
        await loadCardData(token);
        await fetchUserData(token);
        // Fetch food list after user data is loaded
        await fetchFoodList();
      } else {
        // If no token, fetch food list without user data
        await fetchFoodList();
      }
    }
    loadData();
  }, []);

  // Refetch food list when user data changes to apply dynamic pricing
  useEffect(() => {
    if (userData) {
      console.log("🔄 User data changed, refetching food list with pricing");
      fetchFoodList();
    }
  }, [userData]);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    userData,
  };
  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};
export default StoreContextProvider;

StoreContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

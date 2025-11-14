import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

export const StoreContext = createContext(null);

const MAX_QTY_PER_ITEM = 10;
const MAX_DISTINCT_ITEMS = 15;

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = "http://localhost:4000";
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [userData, setUserData] = useState(null);

  const addToCart = async (itemId, quantity = 1) => {
    setCartItems((prev) => {
      const currentQty = prev[itemId] || 0;
      const newQty = currentQty + quantity;

      // Check if adding this quantity would exceed max per item
      if (newQty > MAX_QTY_PER_ITEM) {
        toast.error(`Maximum ${MAX_QTY_PER_ITEM} units per item allowed`);
        return prev; // Return unchanged state
      }

      // Check if adding a new distinct item would exceed max distinct items
      const distinctItemCount = Object.keys(prev).filter(
        (id) => prev[id] > 0
      ).length;
      if (!prev[itemId] && distinctItemCount >= MAX_DISTINCT_ITEMS) {
        toast.error(
          `Maximum ${MAX_DISTINCT_ITEMS} different items allowed in cart`
        );
        return prev; // Return unchanged state
      }

      // Update cart with new quantity
      return { ...prev, [itemId]: newQty };
    });

    // Make API calls for each item added (for backend sync)
    if (token) {
      try {
        // Call API for each quantity added
        const promises = [];
        for (let i = 0; i < quantity; i++) {
          promises.push(
            axios.post(
              url + "/api/cart/add",
              { itemId },
              { headers: { token } }
            )
          );
        }
        await Promise.all(promises);
        // Show toast for single item additions (used by FoodItem component)
        // ProductDetail handles its own toast messages
        if (quantity === 1) {
          toast.success("item Added to Cart");
        }
      } catch (error) {
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
    if (cartItems) {
      for (const item in cartItems) {
        if (cartItems[item] > 0) {
          let itemInfo = food_list.find((product) => product._id === item);
          if (itemInfo && itemInfo.price) {
            totalAmount += itemInfo.price * cartItems[item];
          }
        }
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    try {
      let apiUrl = url + "/api/food/list";

      if (token && userData) {
        const params = new URLSearchParams({
          userId: userData._id,
          city: userData.city || "Kathmandu",
        });
        apiUrl += `?${params.toString()}`;
      }

      const response = await axios.get(apiUrl);
      if (response.data.success && response.data.data) {
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
        setFoodList([]);
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      setFoodList([]);
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
        await fetchFoodList();
      } else {
        await fetchFoodList();
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (userData) {
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

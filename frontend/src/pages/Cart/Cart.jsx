import { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { food_list, cartItems, removeFromCart, getTotalCartAmount, url } =
    useContext(StoreContext);

  // Calculate total savings from discounts
  const getTotalSavings = () => {
    let totalSavings = 0;
    const savingsBreakdown = [];

    food_list.forEach((item) => {
      if (
        cartItems[item._id] > 0 &&
        item.discount > 0 &&
        item.originalPrice &&
        item.price
      ) {
        const savingsPerItem = item.originalPrice - item.price;
        const itemTotalSavings = savingsPerItem * cartItems[item._id];
        totalSavings += itemTotalSavings;

        savingsBreakdown.push({
          name: item.name,
          quantity: cartItems[item._id],
          originalPrice: item.originalPrice,
          discountedPrice: item.price,
          discount: item.discount,
          appliedRule: item.appliedRule,
          savingsPerItem: savingsPerItem,
          totalSavings: itemTotalSavings,
        });
      }
    });

    // Console log cart savings breakdown
    if (savingsBreakdown.length > 0) {
      console.log("\n💰 CART SAVINGS BREAKDOWN:");
      savingsBreakdown.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.name} (Qty: ${item.quantity}):`);
        console.log(
          `   Original: Rs. ${item.originalPrice} × ${item.quantity} = Rs. ${(
            item.originalPrice * item.quantity
          ).toFixed(2)}`
        );
        console.log(
          `   Discounted: Rs. ${item.discountedPrice} × ${
            item.quantity
          } = Rs. ${(item.discountedPrice * item.quantity).toFixed(2)}`
        );
        console.log(`   Discount: ${item.discount}% (${item.appliedRule})`);
        console.log(`   Savings: Rs. ${item.totalSavings.toFixed(2)}`);
      });
      console.log(`\n💵 TOTAL CART SAVINGS: Rs. ${totalSavings.toFixed(2)}`);
    } else {
      console.log("\n🛒 CART: No discounts applied");
    }

    return totalSavings;
  };

  // Calculate original total (before discounts)
  const getOriginalTotal = () => {
    let originalTotal = 0;
    food_list.forEach((item) => {
      if (cartItems[item._id] > 0 && item.price) {
        if (item.originalPrice) {
          originalTotal += item.originalPrice * cartItems[item._id];
        } else {
          originalTotal += item.price * cartItems[item._id];
        }
      }
    });
    return originalTotal;
  };

  const navigate = useNavigate();

  // Show loading if food_list is not loaded yet
  if (!food_list || food_list.length === 0) {
    return (
      <div className="cart">
        <div className="cart-loading">
          <p>Loading cart items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Discount</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id] > 0) {
            return (
              <div key={index}>
                <div className="cart-items-title cart-items-item">
                  <img src={url + "/images/" + item.image} alt="" />
                  <p>{item.name}</p>
                  <div className="cart-price-info">
                    {item.discount > 0 && item.originalPrice && item.price ? (
                      <div>
                        <p className="cart-current-price">Rs. {item.price}</p>
                        <p className="cart-original-price">
                          Rs. {item.originalPrice}
                        </p>
                      </div>
                    ) : (
                      <p>Rs. {item.price || 0}</p>
                    )}
                  </div>
                  <div className="cart-discount-info">
                    {item.discount > 0 && item.originalPrice && item.price ? (
                      <div>
                        <p className="cart-discount-percent">
                          -{item.discount}%
                        </p>
                        <p className="cart-discount-amount">
                          Save Rs.{" "}
                          {(
                            (item.originalPrice - item.price) *
                            cartItems[item._id]
                          ).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p>-</p>
                    )}
                  </div>
                  <p>{cartItems[item._id]}</p>
                  <p>Rs. {(item.price || 0) * cartItems[item._id]}</p>
                  <p onClick={() => removeFromCart(item._id)} className="cross">
                    x
                  </p>
                </div>
                <hr />
              </div>
            );
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            {getTotalSavings() > 0 && (
              <>
                <div className="cart-total-details">
                  <p>Original Total</p>
                  <p>Rs. {getOriginalTotal().toFixed(2)}</p>
                </div>
                <div className="cart-total-details cart-savings">
                  <p>You Save</p>
                  <p className="savings-amount">
                    -Rs. {getTotalSavings().toFixed(2)}
                  </p>
                </div>
                <hr />
              </>
            )}
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>Rs. {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>Rs. {getTotalCartAmount() === 0 ? 0 : 2}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                Rs. {getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}
              </b>
            </div>
          </div>
          <button onClick={() => navigate("/order")}>
            PROCEED TO CHECKOUT
          </button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promocode, Enter it here</p>
            <div className="cart-promocode-input">
              <input type="text" placeholder="promo code" />
              <button>Submit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

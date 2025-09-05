import { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { assets } from "../../assets/frontend_assets/assets";
import { toast } from "react-toastify";

const MyOrders = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const fetchOrders = async () => {
    const response = await axios.post(
      url + "/api/order/userorders",
      {},
      { headers: { token } }
    );
    if (response.data.success) {
      setData(response.data.data);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const submitRating = async (orderId) => {
    try {
      const response = await axios.post(
        url + "/api/order/rating",
        {
          orderId,
          rating,
          review,
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Rating submitted successfully!");
        setRatingOrder(null);
        setRating(5);
        setReview("");
        fetchOrders(); // Refresh orders to show updated rating
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error submitting rating");
    }
  };

  const openRatingModal = (order) => {
    setRatingOrder(order);
    setRating(order.rating || 5);
    setReview(order.review || "");
  };
  return (
    <div className="my-orders">
      <h2>Orders</h2>
      <div className="container">
        {data.map((order, index) => {
          return (
            <div key={index} className="my-orders-order">
              <img src={assets.parcel_icon} alt="" />
              <p>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " X " + item.quantity;
                  } else {
                    return item.name + " X " + item.quantity + ",";
                  }
                })}
              </p>
              <p>Rs. {order.amount}.00</p>
              <p>items: {order.items.length}</p>
              <p>
                <span>&#x25cf;</span>
                <b> {order.status}</b>
              </p>
              {order.rating ? (
                <div className="order-rating">
                  <span>Rating: {order.rating}/5</span>
                  {order.review && <p>Review: {order.review}</p>}
                </div>
              ) : (
                <button
                  onClick={() => openRatingModal(order)}
                  className="rate-order-btn"
                >
                  Rate Order
                </button>
              )}
              <button onClick={fetchOrders}>Track Order</button>
            </div>
          );
        })}
      </div>

      {/* Rating Modal */}
      {ratingOrder && (
        <div className="rating-modal">
          <div className="rating-modal-content">
            <h3>Rate Your Order</h3>
            <div className="rating-input">
              <label>Rating:</label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= rating ? "active" : ""}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="review-input">
              <label>Review (optional):</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience..."
                maxLength={500}
              />
            </div>
            <div className="rating-buttons">
              <button
                onClick={() => setRatingOrder(null)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => submitRating(ratingOrder._id)}
                className="submit-btn"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;

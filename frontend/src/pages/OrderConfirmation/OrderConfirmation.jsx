import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./OrderConfirmation.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/frontend_assets/assets";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { url, token } = useContext(StoreContext);
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      toast.error("Invalid order");
      navigate("/");
      setLoading(false);
      return;
    }

    if (!token) {
      toast.error("Please login to view order");
      navigate("/");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${url}/api/order/${orderId}`, {
          headers: { token },
        });

        if (response.data.success) {
          setOrder(response.data.data);
        } else {
          toast.error("Order not found");
          navigate("/");
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching order details");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, token, url, navigate]);

  if (loading) {
    return (
      <div className="order-confirmation">
        <div className="confirmation-loading">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="order-confirmation">
      <div className="confirmation-container">
        <div className="confirmation-header">
          <div className="success-icon">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" fill="#4CAF50" />
              <path
                d="M8 12l2 2 4-4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1>Order Placed Successfully!</h1>
          <p className="order-id">Order ID: {order._id}</p>
        </div>

        <div className="confirmation-message">
          <div className="message-box">
            <h2>📞 You'll receive a confirmation call shortly</h2>
            <p>
              Our team will call you at <strong>{order.address.phone}</strong>{" "}
              to confirm your order details and delivery time.
            </p>
          </div>

          <div className="payment-info">
            <h3>💵 Payment Method</h3>
            <p className="payment-method">Cash on Delivery</p>
            <p className="payment-note">
              Please keep the exact amount ready. Payment will be collected when
              your order is delivered.
            </p>
          </div>
        </div>

        <div className="order-details">
          <h2>Order Details</h2>
          <div className="details-section">
            <div className="detail-item">
              <span className="detail-label">Order Date:</span>
              <span className="detail-value">{formatDate(order.date)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value status">{order.status}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Amount:</span>
              <span className="detail-value amount">Rs. {order.amount}</span>
            </div>
          </div>
        </div>

        <div className="delivery-address">
          <h2>Delivery Address</h2>
          <div className="address-box">
            <p>
              <strong>{order.address.name}</strong>
            </p>
            <p>{order.address.street}</p>
            <p>
              {order.address.city}, {order.address.state}
            </p>
            <p>Phone: {order.address.phone}</p>
            <p>Email: {order.address.email}</p>
          </div>
        </div>

        <div className="order-items">
          <h2>Order Items</h2>
          <div className="items-list">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-quantity">Quantity: {item.quantity}</p>
                </div>
                <p className="item-price">
                  Rs. {item.price} × {item.quantity} = Rs.{" "}
                  {(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="confirmation-actions">
          <button
            onClick={() => navigate("/myorders")}
            className="btn-primary"
          >
            View My Orders
          </button>
          <button onClick={() => navigate("/menu")} className="btn-secondary">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;


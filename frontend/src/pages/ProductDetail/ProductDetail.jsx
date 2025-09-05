import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetail.css";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/frontend_assets/assets";
import { toast } from "react-toastify";
import axios from "axios";
import FoodItem from "../../components/FoodItem/FoodItem";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, cartItems, url, userData, token } =
    useContext(StoreContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let apiUrl = `${url}/api/food/${id}`;

        // Add user ID and city to the request if user is logged in
        if (token && userData) {
          const params = new URLSearchParams({
            userId: userData._id,
            city: userData.city || "Kathmandu",
          });
          apiUrl += `?${params.toString()}`;
        }

        const response = await axios.get(apiUrl);
        if (response.data.success) {
          setProduct(response.data.data);
        } else {
          toast.error("Product not found");
          navigate("/menu");
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching product");
        navigate("/menu");
      } finally {
        setLoading(false);
      }
    };

    const fetchRecommendations = async () => {
      if (!token || !userData) return;

      try {
        const response = await axios.get(
          `${url}/api/food/recommendations/${userData._id}`,
          { headers: { token } }
        );

        if (response.data.success) {
          // Filter out the current product from recommendations
          const filteredRecommendations = response.data.data
            .filter((item) => item._id !== id)
            .slice(0, 4);
          setRecommendations(filteredRecommendations);
        }
      } catch (error) {
        console.log("Error fetching recommendations:", error);
      }
    };

    if (id) {
      fetchProduct();
      fetchRecommendations();
    }
  }, [id, url, navigate, token, userData]);

  // Refetch product when user data changes to apply dynamic pricing
  useEffect(() => {
    if (id && userData) {
      const fetchProductWithPricing = async () => {
        try {
          let apiUrl = `${url}/api/food/${id}`;

          if (token && userData) {
            const params = new URLSearchParams({
              userId: userData._id,
              city: userData.city || "Kathmandu",
            });
            apiUrl += `?${params.toString()}`;
          }

          const response = await axios.get(apiUrl);
          if (response.data.success) {
            setProduct(response.data.data);
          }
        } catch (error) {
          console.log("Error refetching product with pricing:", error);
        }
      };

      fetchProductWithPricing();
    }
  }, [userData]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(id);
    }
    toast.success(`${quantity} item(s) added to cart`);
  };

  const handleQuantityChange = (change) => {
    setQuantity((prev) => {
      const newQuantity = prev + change;
      return newQuantity >= 1 ? newQuantity : 1;
    });
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <h2>Product not found</h2>
        <button onClick={() => navigate("/menu")} className="back-to-menu-btn">
          Back to Menu
        </button>
      </div>
    );
  }

  console.log(product.averageRating, product.totalRatings);

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <div className="product-detail-left">
          <div className="product-image-container">
            <img
              src={`${url}/images/${product.image}`}
              alt={product.name}
              className="product-detail-image"
            />
          </div>
        </div>

        <div className="product-detail-right">
          <div className="product-info">
            <h1 className="product-name">{product.name}</h1>

            <div className="product-rating">
              <img src={assets.rating_starts} alt="Rating" />
              <span>
                {product.averageRating
                  ? product.averageRating.toFixed(1)
                  : "4.8"}
                {product.totalRatings
                  ? ` (${product.totalRatings} reviews)`
                  : " (120 reviews)"}
              </span>
            </div>

            <div className="product-price">
              {product.discount > 0 &&
              product.originalPrice &&
              product.price ? (
                <div className="price-with-discount">
                  <div className="price-info">
                    <span className="current-price">Rs. {product.price}</span>
                    <span className="original-price">
                      Rs. {product.originalPrice}
                    </span>
                  </div>
                  <div className="discount-info">
                    <span className="discount-badge">
                      -{product.discount}% OFF
                    </span>
                    <span className="discount-amount">
                      Save Rs.{" "}
                      {(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </div>
                  <span className="price-label">per serving</span>
                </div>
              ) : (
                <div>
                  <span className="price">Rs. {product.price || 0}</span>
                  <span className="price-label">per serving</span>
                </div>
              )}
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="product-category">
              <span className="category-label">Category:</span>
              <span className="category-value">{product.category}</span>
            </div>

            <div className="quantity-selector">
              <h3>Quantity</h3>
              <div className="quantity-controls">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity-value">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-actions">
              {!cartItems[id] ? (
                <button onClick={handleAddToCart} className="add-to-cart-btn">
                  <img src={assets.add_icon_white} alt="Add" />
                  Add to Cart
                </button>
              ) : (
                <div className="cart-controls">
                  <button
                    onClick={() => removeFromCart(id)}
                    className="remove-btn"
                  >
                    <img src={assets.remove_icon_red} alt="Remove" />
                    Remove from Cart
                  </button>
                  <div className="cart-quantity">
                    <span>In Cart: {cartItems[id]}</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate("/cart")}
                className="view-cart-btn"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="product-recommendations">
          <h3>You might also like</h3>
          <div className="recommendations-grid">
            {recommendations.map((item, index) => (
              <FoodItem
                key={index}
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                originalPrice={item.originalPrice}
                discount={item.discount}
                appliedRule={item.appliedRule}
                image={item.image}
                averageRating={item.averageRating}
                totalRatings={item.totalRatings}
              />
            ))}
          </div>
        </div>
      )}

      <div className="product-detail-footer">
        <button onClick={() => navigate("/menu")} className="back-to-menu-btn">
          ← Back to Menu
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;

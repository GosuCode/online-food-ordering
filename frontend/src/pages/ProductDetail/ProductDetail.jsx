import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductDetail.css";
import { StoreContext } from "../../context/StoreContext";
import { assets } from "../../assets/frontend_assets/assets";
import { toast } from "react-toastify";
import axios from "axios";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, cartItems, url } =
    useContext(StoreContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${url}/api/food/${id}`);
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

    if (id) {
      fetchProduct();
    }
  }, [id, url, navigate]);

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
              <span>4.8 (120 reviews)</span>
            </div>

            <div className="product-price">
              <span className="price">Rs. {product.price}</span>
              <span className="price-label">per serving</span>
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

      <div className="product-detail-footer">
        <button onClick={() => navigate("/menu")} className="back-to-menu-btn">
          ← Back to Menu
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;

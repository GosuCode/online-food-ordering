import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./FoodItem.css";
import { assets } from "../../assets/frontend_assets/assets";
import { StoreContext } from "../../context/StoreContext";
import PropTypes from "prop-types";

const FoodItem = ({
  id,
  name,
  price,
  originalPrice,
  discount,
  appliedRule,
  description,
  image,
  averageRating,
  totalRatings,
}) => {
  const { cartItems, addToCart, removeFromCart, url } =
    useContext(StoreContext);
  const navigate = useNavigate();

  const handleProductClick = (e) => {
    if (e.target.closest(".add") || e.target.closest(".food-item-counter")) {
      return;
    }
    navigate(`/product/${id}`);
  };

  return (
    <div className="food-item" onClick={handleProductClick}>
      <div className="food-item-img-container">
        <img
          src={url + "/images/" + image}
          alt=""
          className="food-item-image"
        />
        {!cartItems || !cartItems[id] ? (
          <img
            className="add"
            onClick={(e) => {
              e.stopPropagation();
              addToCart(id);
            }}
            src={assets.add_icon_white}
            alt=""
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={(e) => {
                e.stopPropagation();
                removeFromCart(id);
              }}
              src={assets.remove_icon_red}
              alt=""
            />
            <p>{cartItems?.[id] || 0}</p>
            <img
              onClick={(e) => {
                e.stopPropagation();
                addToCart(id);
              }}
              src={assets.add_icon_green}
              alt=""
            />
          </div>
        )}
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <div className="rating-display">
            <img src={assets.rating_starts} alt="" />
            <span className="rating-text">
              {averageRating ? averageRating.toFixed(1) : "4.8"}
              {totalRatings && ` (${totalRatings})`}
            </span>
          </div>
        </div>
        <p className="food-item-desc">{description}</p>
        <div className="food-item-pricing">
          {discount > 0 && originalPrice && price ? (
            <div className="price-with-discount">
              <div className="price-row">
                <p className="food-item-price">Rs. {price}</p>
                <p className="food-item-original-price">Rs. {originalPrice}</p>
              </div>
              <div className="discount-row">
                <span className="discount-badge">-{discount}%</span>
                <span className="discount-amount">
                  Save Rs. {(originalPrice - price).toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p className="food-item-price">Rs. {price || 0}</p>
          )}
          {appliedRule && <p className="discount-reason">{appliedRule}</p>}
        </div>
      </div>
    </div>
  );
};

export default FoodItem;

FoodItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  originalPrice: PropTypes.number,
  discount: PropTypes.number,
  appliedRule: PropTypes.string,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  averageRating: PropTypes.number,
  totalRatings: PropTypes.number,
};

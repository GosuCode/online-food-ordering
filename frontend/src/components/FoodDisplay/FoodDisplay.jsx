import { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import PropTypes from "prop-types";

const FoodDisplay = ({ category }) => {
  const { food_list } = useContext(StoreContext);

  const filteredFoodItems = food_list
    .filter((item) => category === "All" || category === item.category)
    .slice(0, 10);

  return (
    <div className="food-display" id="food-display">
      <h2>Top Picks For You</h2>
      <div className="food-display-list">
        {filteredFoodItems.map((item, index) => (
          <FoodItem
            key={index}
            id={item._id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.image}
            averageRating={item.averageRating}
            totalRatings={item.totalRatings}
          />
        ))}
      </div>
    </div>
  );
};

export default FoodDisplay;

FoodDisplay.propTypes = {
  category: PropTypes.string.isRequired,
};

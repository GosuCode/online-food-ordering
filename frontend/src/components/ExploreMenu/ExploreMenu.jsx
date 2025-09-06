import "./ExploreMenu.css";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const ExploreMenu = ({ category, setCategory }) => {
  const navigate = useNavigate();
  const { url } = useContext(StoreContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/api/food/categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [url]);

  const handleCategoryClick = (categoryName) => {
    setCategory((prev) => (prev === categoryName ? "All" : categoryName));

    navigate("/menu", {
      state: {
        category: categoryName === category ? "All" : categoryName,
      },
    });
  };
  if (loading) {
    return (
      <div className="explore-menu" id="explore-menu">
        <h1>Explore our menu</h1>
        <p className="explore-menu-text">
          Choose from a diverse menu featuring a delectable array of dishes. Our
          mission is to satisfy your cravings and elevate your dining
          experience, one delicious meal at a time.
        </p>
        <div className="explore-menu-list">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="explore-menu-list-item loading">
              <div className="loading-placeholder"></div>
              <div className="loading-text"></div>
            </div>
          ))}
        </div>
        <hr />
      </div>
    );
  }

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore our menu</h1>
      <p className="explore-menu-text">
        Choose from a diverse menu featuring a delectable array of dishes. Our
        mission is to satisfy your cravings and elevate your dining experience,
        one delicious meal at a time.
      </p>
      <div className="explore-menu-list">
        {categories.map((item, index) => {
          return (
            <div
              onClick={() => handleCategoryClick(item.name)}
              key={index}
              className={`explore-menu-list-item ${
                category === item.name ? "active" : ""
              }`}
            >
              <img
                src={item.image}
                alt={item.displayName}
                className="category-image"
              />
              <p>{item.displayName}</p>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};

export default ExploreMenu;

ExploreMenu.propTypes = {
  category: PropTypes.string.isRequired,
  setCategory: PropTypes.func.isRequired,
};

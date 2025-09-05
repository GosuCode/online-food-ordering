import { useContext, useEffect, useState } from "react";
import "./Recommendations.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import axios from "axios";

const Recommendations = () => {
  const { url, token, userData } = useContext(StoreContext);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    if (!token || !userData) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${url}/api/food/recommendations/${userData._id}`,
        { headers: { token } }
      );

      if (response.data.success) {
        setRecommendations(response.data.data);
      }
    } catch (error) {
      console.log("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [token, userData]);

  if (loading) {
    return (
      <div className="recommendations">
        <h2>Recommended for You</h2>
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>Finding the perfect dishes for you...</p>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div
      className="food-display"
      id="food-display"
      style={{ marginBottom: "80px" }}
    >
      <h2>Recommended for You</h2>
      <div className="food-display-list">
        {recommendations.map((item, index) => (
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

export default Recommendations;

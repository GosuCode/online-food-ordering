import { useState } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import { Link } from "react-router-dom";

const Home = () => {
  const [category, setCategory] = useState("All");
  return (
    <div>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />

      {/* CTA Section */}
      <div
        className="about-cta"
        style={{
          marginTop: "80px",
          background:
            "linear-gradient(to right,rgba(244, 89, 42, 0.92),rgb(223, 83, 14))",
          borderRadius: "10px",
        }}
      >
        <div className="container">
          <h2>Ready to Experience Great Food?</h2>
          <p>
            Join thousands of satisfied customers and order your next meal
            today!
          </p>
          <div className="cta-buttons">
            <Link to="/menu" className="cta-button primary">
              Browse Menu
            </Link>
            <Link to="/" className="cta-button secondary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

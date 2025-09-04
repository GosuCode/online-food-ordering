import "./ExploreMenu.css";
import { menu_list } from "../../assets/frontend_assets/assets";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

const ExploreMenu = ({ category, setCategory }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (item) => {
    setCategory((prev) => (prev === item.menu_name ? "All" : item.menu_name));

    navigate("/menu", {
      state: {
        category: item.menu_name === category ? "All" : item.menu_name,
      },
    });
  };
  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore our menu</h1>
      <p className="explore-menu-text">
        Choose from a diverse menu featuring a detectable array of dishes. Our
        mission is to satisfy your cravings and elevate your dining experience,
        one delicious meal at a time.
      </p>
      <div className="explore-menu-list">
        {menu_list.map((item, index) => {
          return (
            <div
              onClick={() => handleCategoryClick(item)}
              key={index}
              className="explore-menu-list-item"
            >
              <img
                className={category === item.menu_name ? "active" : ""}
                src={item.menu_image}
                alt=""
              />
              <p>{item.menu_name}</p>
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

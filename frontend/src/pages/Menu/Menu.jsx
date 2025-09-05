import { useContext, useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Menu.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";

const Menu = () => {
  const { food_list } = useContext(StoreContext);
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "All",
    ...new Set(food_list.map((item) => item.category)),
  ];

  useEffect(() => {
    if (location.state?.category) {
      setSelectedCategory(location.state.category);
    }
  }, [location.state]);

  const priceRangeData = useMemo(() => {
    if (food_list.length === 0) return { min: 0, max: 1000 };
    const prices = food_list.map((item) => item.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [food_list]);

  const [priceRange, setPriceRange] = useState(() => {
    if (food_list.length === 0) return [0, 1000];
    const prices = food_list.map((item) => item.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  });

  const filteredFoodItems = useMemo(() => {
    let filtered = food_list.filter((item) => {
      const categoryMatch =
        selectedCategory === "All" || item.category === selectedCategory;
      const priceMatch =
        item.price >= priceRange[0] && item.price <= priceRange[1];
      return categoryMatch && priceMatch;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [food_list, selectedCategory, priceRange, sortBy]);

  const handlePriceRangeChange = (index, value) => {
    const newRange = [...priceRange];
    newRange[index] = parseInt(value);
    setPriceRange(newRange);
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setPriceRange([priceRangeData.min, priceRangeData.max]);
    setSortBy("name");
  };

  return (
    <div className="menu">
      <div className="menu-header">
        <h1>Our Menu</h1>
        <p>Discover our delicious selection of food items</p>
        <button
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      <div className="menu-container">
        {/* Mobile Overlay */}
        {showFilters && (
          <div
            className="filter-overlay"
            onClick={() => setShowFilters(false)}
          ></div>
        )}

        {/* Filter Sidebar */}
        <div className={`filter-sidebar ${showFilters ? "show" : ""}`}>
          <div className="filter-section">
            <div className="filter-header">
              <h3>Filters</h3>
              <button
                className="close-filters-btn"
                onClick={() => setShowFilters(false)}
              >
                ×
              </button>
            </div>

            {/* Category Filter */}
            <div className="filter-group">
              <h4>Category</h4>
              <div className="filter-options">
                {categories.map((category, index) => (
                  <label key={index} className="filter-option">
                    <input
                      type="radio"
                      name="category"
                      value={category}
                      checked={selectedCategory === category}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="price-range">
                <div className="price-inputs">
                  <input
                    type="number"
                    min={priceRangeData.min}
                    max={priceRangeData.max}
                    value={priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    placeholder="Min"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    min={priceRangeData.min}
                    max={priceRangeData.max}
                    value={priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    placeholder="Max"
                  />
                </div>
                <div className="price-range-display">
                  ${priceRange[0]} - ${priceRange[1]}
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="filter-group">
              <h4>Sort By</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="menu-main-content">
          <div className="menu-categories">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`category-btn ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="menu-content">
            <div className="results-info">
              <p>Showing {filteredFoodItems.length} items</p>
            </div>
            <div className="menu-items">
              {filteredFoodItems.length > 0 ? (
                filteredFoodItems.map((item, index) => (
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
                  />
                ))
              ) : (
                <div className="no-items">
                  <p>No items found matching your filters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;

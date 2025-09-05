import React, { useState, useEffect } from "react";
import "./Pricing.css";
import { assets } from "../../assets/assets";

const Pricing = () => {
  const [pricingRules, setPricingRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "demand",
    priority: 1,
    isActive: true,
    demandLevel: "",
    demandDiscount: 0,
    userType: "",
    newUserDiscount: 0,
    loyaltyTier: "",
    loyaltyDiscount: 0,
    minOrders: 0,
    minSpent: 0,
    weatherCondition: "",
    weatherDiscount: 0,
    applicableCategories: [],
    maxDiscount: 50,
    minPrice: 0,
  });

  const token = localStorage.getItem("token");
  const url = "http://localhost:4000";

  useEffect(() => {
    fetchPricingRules();
  }, []);

  const fetchPricingRules = async () => {
    try {
      const response = await fetch(`${url}/api/food/pricing/rules`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPricingRules(data.data);
      }
    } catch (error) {
      console.error("Error fetching pricing rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${url}/api/food/pricing/rules${
          editingRule ? `/${editingRule._id}` : ""
        }`,
        {
          method: editingRule ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchPricingRules();
        setShowAddForm(false);
        setEditingRule(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving pricing rule:", error);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      type: rule.type,
      priority: rule.priority,
      isActive: rule.isActive,
      demandLevel: rule.demandLevel || "",
      demandDiscount: rule.demandDiscount || 0,
      userType: rule.userType || "",
      newUserDiscount: rule.newUserDiscount || 0,
      loyaltyTier: rule.loyaltyTier || "",
      loyaltyDiscount: rule.loyaltyDiscount || 0,
      minOrders: rule.minOrders || 0,
      minSpent: rule.minSpent || 0,
      weatherCondition: rule.weatherCondition || "",
      weatherDiscount: rule.weatherDiscount || 0,
      applicableCategories: rule.applicableCategories || [],
      maxDiscount: rule.maxDiscount || 50,
      minPrice: rule.minPrice || 0,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "demand",
      priority: 1,
      isActive: true,
      demandLevel: "",
      demandDiscount: 0,
      userType: "",
      newUserDiscount: 0,
      loyaltyTier: "",
      loyaltyDiscount: 0,
      minOrders: 0,
      minSpent: 0,
      weatherCondition: "",
      weatherDiscount: 0,
      applicableCategories: [],
      maxDiscount: 50,
      minPrice: 0,
    });
  };

  const getRuleTypeLabel = (type) => {
    const labels = {
      demand: "Demand-Based",
      user: "User-Based",
      loyalty: "Loyalty-Based",
      weather: "Weather-Based",
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority) => {
    if (priority >= 4) return "#ff6b6b";
    if (priority >= 3) return "#ffa726";
    if (priority >= 2) return "#66bb6a";
    return "#42a5f5";
  };

  if (loading) {
    return <div className="pricing-loading">Loading pricing rules...</div>;
  }

  return (
    <div className="pricing-container">
      <div className="pricing-header">
        <h2>Dynamic Pricing Management</h2>
        <button
          className="add-rule-btn"
          onClick={() => {
            setShowAddForm(true);
            setEditingRule(null);
            resetForm();
          }}
        >
          <img src={assets.add_icon} alt="Add" />
          Add New Rule
        </button>
      </div>

      {showAddForm && (
        <div className="pricing-form-overlay">
          <div className="pricing-form">
            <div className="form-header">
              <h3>
                {editingRule ? "Edit Pricing Rule" : "Add New Pricing Rule"}
              </h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingRule(null);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Rule Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Rule Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="demand">Demand-Based</option>
                  <option value="user">User-Based</option>
                  <option value="loyalty">Loyalty-Based</option>
                  <option value="weather">Weather-Based</option>
                </select>
              </div>

              <div className="form-group">
                <label>Priority (1-4, higher = more priority)</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  Active
                </label>
              </div>

              {formData.type === "demand" && (
                <>
                  <div className="form-group">
                    <label>Demand Level</label>
                    <select
                      value={formData.demandLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          demandLevel: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Level</option>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Discount Percentage</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.demandDiscount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          demandDiscount: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </>
              )}

              {formData.type === "user" && (
                <>
                  <div className="form-group">
                    <label>User Type</label>
                    <select
                      value={formData.userType}
                      onChange={(e) =>
                        setFormData({ ...formData, userType: e.target.value })
                      }
                    >
                      <option value="">Select Type</option>
                      <option value="new">New User</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Discount Percentage</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.newUserDiscount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newUserDiscount: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </>
              )}

              {formData.type === "loyalty" && (
                <>
                  <div className="form-group">
                    <label>Loyalty Tier</label>
                    <select
                      value={formData.loyaltyTier}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          loyaltyTier: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Tier</option>
                      <option value="bronze">Bronze</option>
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Discount Percentage</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.loyaltyDiscount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          loyaltyDiscount: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum Orders</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minOrders}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrders: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Minimum Spent ($)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.minSpent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minSpent: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </>
              )}

              {formData.type === "weather" && (
                <>
                  <div className="form-group">
                    <label>Weather Condition</label>
                    <select
                      value={formData.weatherCondition}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weatherCondition: e.target.value,
                        })
                      }
                    >
                      <option value="">Select Condition</option>
                      <option value="hot">Hot</option>
                      <option value="cold">Cold</option>
                      <option value="normal">Normal</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Discount Percentage</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.weatherDiscount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weatherDiscount: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingRule(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit">
                  {editingRule ? "Update Rule" : "Add Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="pricing-rules">
        {pricingRules.map((rule) => (
          <div key={rule._id} className="pricing-rule-card">
            <div className="rule-header">
              <h3>{rule.name}</h3>
              <div className="rule-meta">
                <span
                  className="rule-type"
                  style={{ backgroundColor: getPriorityColor(rule.priority) }}
                >
                  {getRuleTypeLabel(rule.type)}
                </span>
                <span className="rule-priority">Priority: {rule.priority}</span>
                <span
                  className={`rule-status ${
                    rule.isActive ? "active" : "inactive"
                  }`}
                >
                  {rule.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="rule-details">
              {rule.type === "demand" && (
                <p>
                  <strong>Demand Level:</strong> {rule.demandLevel} |{" "}
                  <strong>Discount:</strong> {rule.demandDiscount}%
                </p>
              )}
              {rule.type === "user" && (
                <p>
                  <strong>User Type:</strong> {rule.userType} |{" "}
                  <strong>Discount:</strong> {rule.newUserDiscount}%
                </p>
              )}
              {rule.type === "loyalty" && (
                <p>
                  <strong>Tier:</strong> {rule.loyaltyTier} |{" "}
                  <strong>Discount:</strong> {rule.loyaltyDiscount}% |{" "}
                  <strong>Min Orders:</strong> {rule.minOrders} |{" "}
                  <strong>Min Spent:</strong> ${rule.minSpent}
                </p>
              )}
              {rule.type === "weather" && (
                <p>
                  <strong>Condition:</strong> {rule.weatherCondition} |{" "}
                  <strong>Discount:</strong> {rule.weatherDiscount}%
                </p>
              )}
            </div>

            <div className="rule-actions">
              <button className="edit-btn" onClick={() => handleEdit(rule)}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;

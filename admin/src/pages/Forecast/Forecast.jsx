import { useState, useEffect } from "react";
import "./Forecast.css";

const Forecast = () => {
  const [forecastSummary, setForecastSummary] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodForecast, setFoodForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecastData();
    fetchAlerts();
  }, []);

  const fetchForecastData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:4000/api/forecast/summary",
        {
          headers: { token },
        }
      );
      const data = await response.json();
      if (data.success) {
        setForecastSummary(data.data);
      }
    } catch (error) {
      console.error("Error fetching forecast data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodForecast = async (foodId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/forecast/food/${foodId}?hours=24`,
        {
          headers: { token },
        }
      );
      const data = await response.json();
      if (data.success) {
        setFoodForecast(data.data);
      }
    } catch (error) {
      console.error("Error fetching food forecast:", error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:4000/api/forecast/alerts",
        {
          headers: { token },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    fetchFoodForecast(food.foodId);
  };

  if (loading) {
    return (
      <div className="forecast-loading">
        <div className="loading-spinner"></div>
        <p>Loading forecast data...</p>
      </div>
    );
  }

  return (
    <div className="forecast-container">
      <div className="forecast-header">
        <h1>📊 Demand Forecasting</h1>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          <h3>⚠️ Alerts</h3>
          <div className="alerts-grid">
            {alerts.map((alert, index) => (
              <div key={index} className={`alert alert-${alert.severity}`}>
                <span className="alert-icon">
                  {alert.severity === "warning" ? "⚠️" : "ℹ️"}
                </span>
                <span className="alert-message">{alert.message}</span>
                <span className="alert-count">{alert.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast Summary */}
      <div className="forecast-summary">
        <h2>📈 Forecast Summary</h2>
        <div className="summary-grid">
          {forecastSummary.map((item, index) => (
            <div
              key={index}
              className="summary-card"
              onClick={() => handleFoodSelect(item)}
            >
              <h3>{item.foodName}</h3>
              <div className="summary-metrics">
                <div className="metric">
                  <span className="metric-label">Total Demand (24h):</span>
                  <span className="metric-value">{item.totalDemand}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Peak Hour:</span>
                  <span className="metric-value">{item.peakHour}:00</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Peak Demand:</span>
                  <span className="metric-value">{item.peakDemand}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Confidence:</span>
                  <span className="metric-value">
                    {(item.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              {item.alerts.length > 0 && (
                <div className="item-alerts">
                  {item.alerts.map((alert, i) => (
                    <span key={i} className="item-alert">
                      ⚠️ {alert}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedFood && foodForecast.length > 0 && (
        <div className="forecast-table">
          <h3>🕐 Hourly Forecast Details for {selectedFood.foodName}</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Hour</th>
                  <th>Forecast</th>
                  <th>Lower Bound</th>
                  <th>Upper Bound</th>
                  <th>Confidence</th>
                  <th>Weather Factor</th>
                </tr>
              </thead>
              <tbody>
                {foodForecast.map((item, index) => (
                  <tr key={index}>
                    <td>{item.forecastHour}:00</td>
                    <td className="forecast-value">
                      {item.predictions.pointForecast}
                    </td>
                    <td className="lower-bound">
                      {item.predictions.lowerBound}
                    </td>
                    <td className="upper-bound">
                      {item.predictions.upperBound}
                    </td>
                    <td className="confidence">
                      {(item.predictions.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="weather-factor">
                      {item.weatherFactor?.toFixed(2) || "1.00"}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forecast;

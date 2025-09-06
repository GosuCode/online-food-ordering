import { useState, useEffect } from "react";
import "./Forecast.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const Forecast = () => {
  const [forecastSummary, setForecastSummary] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [foodForecast, setFoodForecast] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    fetchForecastData();
    fetchAlerts();
    fetchConfig();
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

  const fetchHistoricalData = async (foodId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:4000/api/forecast/historical/${foodId}?days=7`,
        {
          headers: { token },
        }
      );
      const data = await response.json();
      if (data.success) {
        setHistoricalData(data.data);
      }
    } catch (error) {
      console.error("Error fetching historical data:", error);
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

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:4000/api/forecast/config",
        {
          headers: { token },
        }
      );
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  // const generateForecasts = async () => {
  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem("token");
  //     const response = await fetch(
  //       "http://localhost:4000/api/forecast/generate",
  //       {
  //         method: "POST",
  //         headers: {
  //           token,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     const data = await response.json();
  //     if (data.success) {
  //       alert(`Generated forecasts for ${data.data.length} food items`);
  //       fetchForecastData();
  //     }
  //   } catch (error) {
  //     console.error("Error generating forecasts:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleFoodSelect = (food) => {
    setSelectedFood(food);
    fetchFoodForecast(food.foodId);
    fetchHistoricalData(food.foodId);
  };

  const formatChartData = (forecastData, historicalData) => {
    const chartData = [];

    // Add historical data
    historicalData.forEach((item) => {
      const hour = item.hour;
      const existing = chartData.find((d) => d.hour === hour);
      if (existing) {
        existing.historical += item.totalQuantity;
      } else {
        chartData.push({
          hour: hour,
          historical: item.totalQuantity,
          forecast: 0,
          lowerBound: 0,
          upperBound: 0,
        });
      }
    });

    // Add forecast data
    forecastData.forEach((item) => {
      const hour = item.forecastHour;
      const existing = chartData.find((d) => d.hour === hour);
      if (existing) {
        existing.forecast = item.predictions.pointForecast;
        existing.lowerBound = item.predictions.lowerBound;
        existing.upperBound = item.predictions.upperBound;
      } else {
        chartData.push({
          hour: hour,
          historical: 0,
          forecast: item.predictions.pointForecast,
          lowerBound: item.predictions.lowerBound,
          upperBound: item.predictions.upperBound,
        });
      }
    });

    return chartData.sort((a, b) => a.hour - b.hour);
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
        <div className="forecast-actions">
          {/* <button
            className="generate-btn"
            onClick={generateForecasts}
            disabled={loading}
          >
            {loading ? "Generating..." : "🔄 Generate Forecasts"}
          </button> */}
          {/* <button
            className="config-btn"
            onClick={() => setShowConfig(!showConfig)}
          >
            ⚙️ Configuration
          </button> */}
        </div>
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

      {/* Configuration Panel */}
      {/* {showConfig && config && (
        <div className="config-panel">
          <h3>⚙️ Forecast Configuration</h3>
          <div className="config-grid">
            <div className="config-item">
              <label>Training Window (days):</label>
              <input type="number" value={config.trainingWindow} readOnly />
            </div>
            <div className="config-item">
              <label>Forecast Horizon (hours):</label>
              <input type="number" value={config.forecastHorizon} readOnly />
            </div>
            <div className="config-item">
              <label>Confidence Level:</label>
              <input type="number" value={config.confidenceLevel} readOnly />
            </div>
            <div className="config-item">
              <label>Weather Integration:</label>
              <input type="checkbox" checked={config.weatherEnabled} readOnly />
            </div>
          </div>
        </div>
      )} */}

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

      {/* Detailed Forecast Chart */}
      {selectedFood && (
        <div className="detailed-forecast">
          <h2>📊 Detailed Forecast: {selectedFood.foodName}</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={formatChartData(foodForecast, historicalData)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  label={{
                    value: "Hour",
                    position: "insideBottom",
                    offset: -10,
                  }}
                />
                <YAxis
                  label={{
                    value: "Demand",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(value, name) => [
                    value,
                    name === "historical"
                      ? "Historical"
                      : name === "forecast"
                      ? "Forecast"
                      : name === "lowerBound"
                      ? "Lower Bound"
                      : "Upper Bound",
                  ]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Historical"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Forecast"
                />
                <Line
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="#ffc658"
                  strokeDasharray="5 5"
                  name="Lower Bound"
                />
                <Line
                  type="monotone"
                  dataKey="upperBound"
                  stroke="#ffc658"
                  strokeDasharray="5 5"
                  name="Upper Bound"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Hourly Forecast Table */}
      {selectedFood && foodForecast.length > 0 && (
        <div className="forecast-table">
          <h3>🕐 Hourly Forecast Details</h3>
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
                      {item.weatherFactor.toFixed(2)}x
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

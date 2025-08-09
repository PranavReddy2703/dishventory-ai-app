import React, { useState, useEffect } from 'react';
import './AllRecipesForecast.css';

const AllRecipesForecast = ({ API_BASE_URL, setError }) => {
  const [forecasts, setForecasts] = useState([]);
  const [allLoading, setAllLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState({ top3: [], low3: [] });

  const fetchAllForecasts = async () => {
    setAllLoading(true);
    setError?.(null);
    try {
      const response = await fetch(`${API_BASE_URL}/forecast/all`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get all recipes forecast');
      }
      const data = await response.json();

      const mapped = data.map(item => ({
        pizza_name: item.pizza_name || '',
        pizza_category: item.pizza_category || '',
        pizza_size: item.pizza_size || '',
        lowest_sales: typeof item.yhat_7day_lower === 'number' ? item.yhat_7day_lower.toFixed(2) : '0.00',
        avg_sales: typeof item.yhat_7day_total === 'number' ? item.yhat_7day_total.toFixed(2) : '0.00',
        highest_sales: typeof item.yhat_7day_upper === 'number' ? item.yhat_7day_upper.toFixed(2) : '0.00',
        pizza_id: item.pizza_id || '',
        yhat_7day_total: item.yhat_7day_total || 0
      }));

      setForecasts(mapped);

      // Calculate top 3 & low 3
      const sorted = [...mapped].sort((a, b) => b.yhat_7day_total - a.yhat_7day_total);
      const top3 = sorted.slice(0, 3);
      const low3 = sorted.slice(-3);

      setStats({ top3, low3 });
    } catch (err) {
      setError?.(err.message);
    } finally {
      setAllLoading(false);
    }
  };

  useEffect(() => {
    fetchAllForecasts();
  }, [API_BASE_URL]);

  const filteredForecasts = forecasts.filter(forecast => {
    const term = searchText.toLowerCase();
    return (
      forecast.pizza_name.toLowerCase().includes(term) ||
      forecast.pizza_category.toLowerCase().includes(term) ||
      forecast.pizza_size.toLowerCase().includes(term)
    );
  });

  return (
    <div className="forecast-section">
      <h3 className="section-title">Next Week's Forecast for All Recipes</h3>

      {/* 📊 Stats Box */}
      <div className="forecast-stats-box">
        <div>
          <h4>Top 3 Sales</h4>
          <ul>
            {stats.top3.map((item, idx) => (
              <li key={idx}>
                {item.pizza_name} ({item.pizza_size}) — {item.yhat_7day_total.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Lowest 3 Sales</h4>
          <ul>
            {stats.low3.map((item, idx) => (
              <li key={idx}>
                {item.pizza_name} ({item.pizza_size}) — {item.yhat_7day_total.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 🔍 Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-input"
        />
      </div>

      {allLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Loading all forecasts...</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Pizza Name</th>
                <th>Category</th>
                <th>Size</th>
                <th className="text-right">Lowest Sales</th>
                <th className="text-right">Avg Sales</th>
                <th className="text-right">Highest Sales</th>
              </tr>
            </thead>
            <tbody>
              {filteredForecasts.map(forecast => (
                <tr key={forecast.pizza_id + '_' + forecast.pizza_size}>
                  <td>{forecast.pizza_name}</td>
                  <td>{forecast.pizza_category}</td>
                  <td>{forecast.pizza_size}</td>
                  <td className="text-right">{forecast.lowest_sales}</td>
                  <td className="text-right">{forecast.avg_sales}</td>
                  <td className="text-right">{forecast.highest_sales}</td>
                </tr>
              ))}
              {!filteredForecasts.length && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllRecipesForecast;

import React, { useState, useEffect } from 'react';
import './AllRecipesForecast.css';

const AllRecipesForecast = ({ recipes, loading, setError, API_BASE_URL, searchQuery, setSearchQuery }) => {
  const [forecasts, setForecasts] = useState([]);
  const [allLoading, setAllLoading] = useState(false);

  const fetchAllForecasts = async () => {
    setAllLoading(true);
    setError(null);
    try {
      const filteredRecipes = recipes.filter(recipe =>
        // Added optional chaining here to prevent a crash
        recipe?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const allForecasts = await Promise.all(
        filteredRecipes.map(async (recipe) => {
          const response = await fetch(`${API_BASE_URL}/forecast?recipeId=${recipe.id}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to get forecast for ${recipe.name}`);
          }
          const data = await response.json();
          
          const salesValues = data.forecast_data.map(d => d.sales);
          const lowestSales = Math.min(...salesValues);
          const highestSales = Math.max(...salesValues);
          const avgSales = (salesValues.reduce((a, b) => a + b, 0) / salesValues.length).toFixed(2);

          return {
            pizza_name: data.pizza_name,
            lowest_sales: lowestSales,
            highest_sales: highestSales,
            avg_sales: avgSales,
            pizza_size: recipe.pizza_size,
            pizza_category: recipe.pizza_category,
            recipe_id: recipe.id
          };
        })
      );
      setForecasts(allForecasts);
    } catch (err) {
      setError(err.message);
    } finally {
      setAllLoading(false);
    }
  };

  useEffect(() => {
    if (recipes.length > 0) {
      fetchAllForecasts();
    }
  }, [recipes, searchQuery]);

  return (
    <div className="forecast-section">
      <h3 className="section-title">Next Week's Forecast for All Recipes</h3>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
              {forecasts.map(forecast => (
                <tr key={forecast.recipe_id}>
                  <td>{forecast.pizza_name}</td>
                  <td>{forecast.pizza_category}</td>
                  <td>{forecast.pizza_size}</td>
                  <td className="text-right">{forecast.lowest_sales}</td>
                  <td className="text-right">{forecast.avg_sales}</td>
                  <td className="text-right">{forecast.highest_sales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllRecipesForecast;

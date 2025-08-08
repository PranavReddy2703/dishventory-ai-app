import React, { useState, useRef, useEffect } from 'react';
import { LucideTrendingUp } from 'lucide-react';
import * as d3 from 'd3';

const SingleRecipeForecast = ({ recipes, ingredients, loading, setError, getIngredientName, API_BASE_URL }) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [forecastResults, setForecastResults] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const svgRef = useRef(null);

  const handleForecast = async () => {
    if (!selectedRecipeId) {
      setError("Please select a recipe to forecast.");
      return;
    }
    setForecastLoading(true);
    setForecastResults(null);
    try {
      const response = await fetch(`${API_BASE_URL}/forecast?recipeId=${selectedRecipeId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get forecast');
      }
      const data = await response.json();
      setForecastResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setForecastLoading(false);
    }
  };

  useEffect(() => {
    if (forecastResults && forecastResults.forecast_data && forecastResults.forecast_data.length > 0) {
      const data = forecastResults.forecast_data.map(d => ({
        date: d3.timeParse("%Y-%m-%d")(d.date),
        sales: d.sales
      }));

      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = 600 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      d3.select(svgRef.current).selectAll("*").remove();

      const svg = d3.select(svgRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.sales)])
        .range([height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));

      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.sales));

      svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#4a90e2")
        .attr("stroke-width", 2)
        .attr("d", line);
    }
  }, [forecastResults]);

  return (
    <div className="forecast-section">
      <h3 className="section-title">Single Recipe Forecast</h3>
      <div className="forecast-form">
        <select
          value={selectedRecipeId}
          onChange={(e) => setSelectedRecipeId(e.target.value)}
          className="form-select flex-grow"
        >
          <option value="">Select a pizza recipe to forecast</option>
          {recipes.map(recipe => (
            <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
          ))}
        </select>
        <button
          onClick={handleForecast}
          disabled={!selectedRecipeId || forecastLoading}
          className="form-button form-button-green"
        >
          {forecastLoading ? (
            <div className="spinner"></div>
          ) : (
            <><LucideTrendingUp size={18} /><span>Run Forecast</span></>
          )}
        </button>
      </div>

      {forecastResults && (
        <div className="forecast-results">
          <h4 className="section-subtitle">Forecast Results for {forecastResults.pizza_name}</h4>
          <p className="forecast-sales-text">
            Predicted total sales for the next 7 days: <span className="text-blue">{forecastResults.predicted_sales} units</span>
          </p>
          <div className="forecast-graph">
            <svg ref={svgRef} className="graph-image"></svg>
          </div>
          <h4 className="section-subtitle">Ingredients Needed:</h4>
          <ul className="ingredients-list">
            {Object.entries(forecastResults.ingredients_needed).map(([name, details]) => (
              <li key={name} className="ingredient-item">
                <span className="font-medium">{name}:</span> {details.quantity} {details.unit}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SingleRecipeForecast;

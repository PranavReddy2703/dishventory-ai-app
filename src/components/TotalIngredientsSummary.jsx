import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './TotalIngredientsSummary.css';

const TotalIngredientsSummary = ({ recipes, ingredients, loading, setError, getIngredientName, API_BASE_URL }) => {
  const [totalIngredients, setTotalIngredients] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [salesChoice, setSalesChoice] = useState('avg'); // 'lowest', 'avg', 'highest'

  const fetchTotalIngredients = async () => {
    setSummaryLoading(true);
    setError(null);
    try {
      const allForecasts = await Promise.all(
        recipes.map(async (recipe) => {
          const response = await fetch(`${API_BASE_URL}/forecast?recipeId=${recipe.id}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to get forecast for ${recipe.name}`);
          }
          return response.json();
        })
      );

      const combinedIngredients = {};
      allForecasts.forEach(forecast => {
        let salesToUse = 0;
        if (salesChoice === 'lowest') {
          salesToUse = forecast.lowest_sales;
        } else if (salesChoice === 'highest') {
          salesToUse = forecast.highest_sales;
        } else {
          salesToUse = forecast.avg_sales;
        }

        for (const [name, details] of Object.entries(forecast.ingredients_needed)) {
          if (!combinedIngredients[name]) {
            combinedIngredients[name] = { quantity: 0, unit: details.unit, available: 0, toBuy: 0 };
          }
          combinedIngredients[name].quantity += details.quantity;
        }
      });

      // Fetch the current stock for each ingredient
      const ingredientsData = await fetch(`${API_BASE_URL}/ingredients`);
      const currentStock = await ingredientsData.json();

      Object.keys(combinedIngredients).forEach(ingredientName => {
        const stockItem = currentStock.find(item => item.name === ingredientName);
        if (stockItem) {
          combinedIngredients[ingredientName].available = stockItem.quantity;
          const toBuy = combinedIngredients[ingredientName].quantity - stockItem.quantity;
          combinedIngredients[ingredientName].toBuy = toBuy > 0 ? toBuy : 0;
        } else {
          // If the ingredient is not in stock, the entire needed quantity needs to be bought
          combinedIngredients[ingredientName].toBuy = combinedIngredients[ingredientName].quantity;
        }
      });
      
      setTotalIngredients(combinedIngredients);
    } catch (err) {
      setError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (recipes.length > 0) {
      fetchTotalIngredients();
    }
  }, [recipes, salesChoice]);

  const formatQuantity = (quantity, unit) => {
    if (unit === 'g' && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(2)} kg`;
    }
    if (unit === 'ml' && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(2)} L`;
    }
    return `${quantity} ${unit}`;
  };

  const handleDownload = () => {
    const data = Object.entries(totalIngredients || {}).map(([name, details]) => ({
      'Ingredient Name': name,
      'Needed': `${details.quantity} ${details.unit}`,
      'In Stock': `${details.available} ${details.unit}`,
      'To Buy': `${details.toBuy} ${details.unit}`,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ingredients Summary");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, "ingredients_summary.xlsx");
  };

  return (
    <div className="forecast-section">
      <h3 className="section-title">Total Ingredients Needed for Next Week</h3>
      <div className="sales-choice">
        <span>Forecast based on:</span>
        <label>
          <input
            type="radio"
            name="salesChoice"
            value="lowest"
            checked={salesChoice === 'lowest'}
            onChange={(e) => setSalesChoice(e.target.value)}
          />{' '}
          Lowest Sales
        </label>
        <label>
          <input
            type="radio"
            name="salesChoice"
            value="avg"
            checked={salesChoice === 'avg'}
            onChange={(e) => setSalesChoice(e.target.value)}
          />{' '}
          Average Sales
        </label>
        <label>
          <input
            type="radio"
            name="salesChoice"
            value="highest"
            checked={salesChoice === 'highest'}
            onChange={(e) => setSalesChoice(e.target.value)}
          />{' '}
          Highest Sales
        </label>
      </div>
      <button onClick={handleDownload} className="download-button" disabled={summaryLoading || !totalIngredients}>
        Download as Excel
      </button>
      {summaryLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>Calculating total ingredients...</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ingredient Name</th>
                <th className="text-right">Needed</th>
                <th className="text-right">In Stock</th>
                <th className="text-right">To Buy</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(totalIngredients || {}).map(([name, details]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="text-right">{formatQuantity(details.quantity, details.unit)}</td>
                  <td className="text-right">{formatQuantity(details.available, details.unit)}</td>
                  <td className="text-right">
                    <span className={details.toBuy > 0 ? 'text-red' : 'text-green'}>
                      {formatQuantity(details.toBuy, details.unit)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TotalIngredientsSummary;

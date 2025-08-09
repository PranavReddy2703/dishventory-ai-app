import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './TotalIngredientsSummary.css';

const TotalIngredientsSummary = ({ ingredients, loading, setError, API_BASE_URL }) => {
  const [totalIngredients, setTotalIngredients] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [salesChoice, setSalesChoice] = useState('avg'); // 'lowest', 'avg', 'highest'

  const fetchTotalIngredients = async () => {
    setSummaryLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/summary`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to get ingredients summary");
      }
      const summaryData = await response.json();

      const combinedIngredients = {};
      summaryData.forEach(item => {
        let quantity = 0;
        if (salesChoice === 'lowest') quantity = item.total_lower;
        else if (salesChoice === 'highest') quantity = item.total_upper;
        else quantity = item.total;

        combinedIngredients[item.ingredient] = {
          name: item.ingredient,
          quantity,
          unit: "g", // default unit
          available: 0
        };
      });

      // match stock from props
      Object.keys(combinedIngredients).forEach(name => {
        const stockItem = ingredients.find(i => i.name === name);
        if (stockItem) {
          combinedIngredients[name].available = stockItem.quantity;
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
    if (ingredients.length > 0) {
      fetchTotalIngredients();
    }
  }, [ingredients, salesChoice]);

  const formatQuantity = (quantity, unit) => {
    if (unit === 'g' && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(2)} kg`;
    }
    if (unit === 'ml' && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(2)} L`;
    }
    return `${quantity.toFixed(2)} ${unit}`;
  };

  const handleDownload = () => {
    const data = Object.values(totalIngredients || {}).map(details => {
      const diff = details.available - details.quantity;
      const status = diff >= 0
        ? `Surplus ${formatQuantity(diff, details.unit)}`
        : `Shortfall ${formatQuantity(Math.abs(diff), details.unit)}`;
      return {
        'Ingredient Name': details.name,
        'Needed': formatQuantity(details.quantity, details.unit),
        'In Stock': formatQuantity(details.available, details.unit),
        'Inventory Status': status
      };
    });

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
        <span>Quantity Needed:</span>
        <label>
          <input
            type="radio"
            name="salesChoice"
            value="lowest"
            checked={salesChoice === 'lowest'}
            onChange={(e) => setSalesChoice(e.target.value)}
          />{' '}
          Min. Qty.
        </label>
        <label>
          <input
            type="radio"
            name="salesChoice"
            value="avg"
            checked={salesChoice === 'avg'}
            onChange={(e) => setSalesChoice(e.target.value)}
          />{' '}
          Average Qty.
        </label>
        <label>
          <input
            type="radio"
            name="salesChoice"
            value="highest"
            checked={salesChoice === 'highest'}
            onChange={(e) => setSalesChoice(e.target.value)}
          />{' '}
          Max. Qty.
        </label>
        <button
          onClick={handleDownload}
          className="download-button"
          disabled={summaryLoading || !totalIngredients}
        >
          Download as Excel
        </button>
      </div>

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
                <th className="text-right">Inventory Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(totalIngredients || {}).map(details => {
                const diff = details.available - details.quantity;
                const isSurplus = diff >= 0;
                return (
                  <tr key={details.name}>
                    <td>{details.name}</td>
                    <td className="text-right">{formatQuantity(details.quantity, details.unit)}</td>
                    <td className="text-right">{formatQuantity(details.available, details.unit)}</td>
                    <td className="text-right">
                      {isSurplus ? (
                        <span className="text-green">
                          {formatQuantity(diff, details.unit)}
                        </span>
                      ) : (
                        <span className="text-red">
                          {formatQuantity(Math.abs(diff), details.unit)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TotalIngredientsSummary;

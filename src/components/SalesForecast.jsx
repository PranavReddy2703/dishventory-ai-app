import { useState } from 'react';
import SingleRecipeForecast from './SingleRecipeForecast';
import AllRecipesForecast from './AllRecipesForecast';
import TotalIngredientsSummary from './TotalIngredientsSummary';
import './SalesForecast.css';

const SalesForecast = ({ recipes, ingredients, loading, setError, getIngredientName, API_BASE_URL }) => {
  const [activeTab, setActiveTab] = useState('single');
  const [forecastData, setForecastData] = useState(null);
  
  return (
    <div className="card">
      <h2 className="card-title">Sales Forecasting</h2>
      
      <nav className="forecast-navbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`forecast-nav-button ${activeTab === 'all' ? 'active' : ''}`}
        >
          All Recipes
        </button>
        <button
          onClick={() => setActiveTab('total')}
          className={`forecast-nav-button ${activeTab === 'total' ? 'active' : ''}`}
        >
          Total Ingredients
        </button>
        <button
          onClick={() => setActiveTab('single')}
          className={`forecast-nav-button ${activeTab === 'single' ? 'active' : ''}`}
        >
          Single Recipe
        </button>
      </nav>

      {activeTab === 'all' && <AllRecipesForecast 
        recipes={recipes} 
        loading={loading}
        setError={setError} 
        API_BASE_URL={API_BASE_URL}
      />}
      
      {activeTab === 'total' && <TotalIngredientsSummary 
        recipes={recipes}
        ingredients={ingredients}
        loading={loading}
        setError={setError}
        getIngredientName={getIngredientName}
        API_BASE_URL={API_BASE_URL}
      />}
      
      {activeTab === 'single' && <SingleRecipeForecast 
        recipes={recipes} 
        ingredients={ingredients}
        loading={loading}
        setError={setError} 
        getIngredientName={getIngredientName}
        API_BASE_URL={API_BASE_URL}
      />}
    </div>
  );
};

export default SalesForecast;

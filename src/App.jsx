import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import InventoryManager from './components/InventoryManager';
import RecipeManager from './components/RecipeManager';
import BillingSystem from './components/BillingSystem';
import OrderHistory from './components/OrderHistory';
import SalesForecast from './components/SalesForecast';
import './App.css';

const API_BASE_URL = "http://127.0.0.1:5000/api";

const App = () => {
  const [activePage, setActivePage] = useState('inventory');
  const [ingredients, setIngredients] = useState([]);
  const [ingredientForm, setIngredientForm] = useState({ name: '', quantity: '', unit: 'g' });
  const [editingIngredientId, setEditingIngredientId] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [recipeForm, setRecipeForm] = useState({ name: '', pizza_id: '', pizza_size: '', pizza_category: '', ingredients: [{ ingredientId: '', quantity: '' }] });
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [forecastResults, setForecastResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients`);
      if (!response.ok) throw new Error('Failed to fetch ingredients');
      const data = await response.json();
      setIngredients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`);
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete order');
      fetchOrders();
      alert("Order deleted successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIngredientName = (id) => {
    const ingredient = ingredients.find(i => i.id === id);
    return ingredient ? `${ingredient.name} (${ingredient.unit})` : id;
  };

  useEffect(() => {
    fetchIngredients();
    fetchRecipes();
    fetchOrders();
  }, []);
  
  const handleIngredientInputChange = (e) => {
    const { name, value } = e.target;
    setIngredientForm({ ...ingredientForm, [name]: value });
  };

  const handleAddOrUpdateIngredient = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingIngredientId ? `${API_BASE_URL}/ingredients/${editingIngredientId}` : `${API_BASE_URL}/ingredients`;
      const method = editingIngredientId ? 'PUT' : 'POST';
      const payload = {
        name: ingredientForm.name,
        quantity: Number(ingredientForm.quantity),
        unit: ingredientForm.unit,
      };
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save ingredient');
      setIngredientForm({ name: '', quantity: '', unit: 'g' });
      setEditingIngredientId(null);
      fetchIngredients();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ingredient?")) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete ingredient');
      fetchIngredients();
      fetchRecipes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditIngredientClick = (ingredient) => {
    setEditingIngredientId(ingredient.id);
    setIngredientForm({ name: ingredient.name, quantity: ingredient.quantity, unit: ingredient.unit });
  };
  
  const handleRecipeInputChange = (e) => {
    const { name, value } = e.target;
    setRecipeForm({ ...recipeForm, [name]: value });
  };

  const handleRecipeIngredientChange = (index, e) => {
    const { name, value } = e.target;
    const newIngredients = [...recipeForm.ingredients];
    newIngredients[index][name] = value;
    setRecipeForm({ ...recipeForm, ingredients: newIngredients });
  };
  
  const handleAddRecipeIngredient = () => {
    setRecipeForm({
      ...recipeForm,
      ingredients: [...recipeForm.ingredients, { ingredientId: '', quantity: '' }],
    });
  };

  const handleRemoveRecipeIngredient = (index) => {
    const newIngredients = recipeForm.ingredients.filter((_, i) => i !== index);
    setRecipeForm({ ...recipeForm, ingredients: newIngredients });
  };

  const handleAddOrUpdateRecipe = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editingRecipeId ? `${API_BASE_URL}/recipes/${editingRecipeId}` : `${API_BASE_URL}/recipes`;
      const method = editingRecipeId ? 'PUT' : 'POST';
      const payload = {
        name: recipeForm.name,
        pizza_id: recipeForm.pizza_id,
        pizza_size: recipeForm.pizza_size,
        pizza_category: recipeForm.pizza_category,
        ingredients: recipeForm.ingredients.map(ing => ({
          ...ing,
          quantity: Number(ing.quantity),
        })),
      };
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save recipe');
      setRecipeForm({ name: '', pizza_id: '', pizza_size: '', pizza_category: '', ingredients: [{ ingredientId: '', quantity: '' }] });
      setEditingRecipeId(null);
      fetchRecipes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteRecipe = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete recipe');
      fetchRecipes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecipeClick = (recipe) => {
    setEditingRecipeId(recipe.id);
    setRecipeForm({ name: recipe.name, pizza_id: recipe.pizza_id, pizza_size: recipe.pizza_size, pizza_category: recipe.pizza_category, ingredients: recipe.ingredients });
  };

  const handleUpdateCartItem = (itemId, newQuantity) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
      return updatedCart.filter(item => item.quantity > 0);
    });
  };
  
  const handleAddToCart = (recipe, quantity = 1) => {
    if (quantity <= 0) return;
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === recipe.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === recipe.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        return [...prevCart, { ...recipe, quantity }];
      }
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };


  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      setError("Your cart is empty. Please add some items.");
      return;
    }
    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        recipeId: item.id,
        quantity: item.quantity,
      }));
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems, paymentMethod }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }
      setCart([]);
      fetchIngredients();
      fetchOrders();
      alert("Order placed successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForecast = async () => {
    if (!selectedRecipeId) {
      setError("Please select a recipe to forecast.");
      return;
    }
    setLoading(true);
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
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(recipeSearchQuery.toLowerCase())
  );
  
  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main className="app-main-content">
        <h1 className="app-title">
          Restaurant Management Dashboard
        </h1>
        {error && <p className="error-message">{error}</p>}
        
        {activePage === 'inventory' && (
          <InventoryManager
            ingredients={filteredIngredients}
            form={ingredientForm}
            setForm={setIngredientForm}
            editingId={editingIngredientId}
            setEditingId={setEditingIngredientId}
            loading={loading}
            setError={setError}
            fetchIngredients={fetchIngredients}
            fetchRecipes={fetchRecipes}
            API_BASE_URL={API_BASE_URL}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {activePage === 'recipes' && (
          <RecipeManager
            recipes={filteredRecipes}
            ingredients={ingredients}
            form={recipeForm}
            setForm={setRecipeForm}
            editingId={editingRecipeId}
            setEditingId={setEditingRecipeId}
            loading={loading}
            setError={setError}
            fetchRecipes={fetchRecipes}
            getIngredientName={getIngredientName}
            API_BASE_URL={API_BASE_URL}
            searchQuery={recipeSearchQuery}
            setSearchQuery={setRecipeSearchQuery}
          />
        )}
        
        {activePage === 'billing' && (
          <BillingSystem
            recipes={filteredRecipes}
            cart={cart}
            setCart={setCart}
            loading={loading}
            setError={setError}
            fetchIngredients={fetchIngredients}
            fetchOrders={fetchOrders}
            handleAddToCart={handleAddToCart}
            handleUpdateCartItem={handleUpdateCartItem}
            handleRemoveFromCart={handleRemoveFromCart}
            handlePlaceOrder={handlePlaceOrder}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            API_BASE_URL={API_BASE_URL}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        )}

        {activePage === 'forecast' && (
          <SalesForecast
            recipes={recipes}
            ingredients={ingredients}
            selectedRecipeId={selectedRecipeId}
            setSelectedRecipeId={setSelectedRecipeId}
            forecastResults={forecastResults}
            setForecastResults={setForecastResults}
            loading={loading}
            setError={setError}
            getIngredientName={getIngredientName}
            API_BASE_URL={API_BASE_URL}
          />
        )}

        {activePage === 'order-history' && (
          <OrderHistory
            orders={orders}
            recipes={recipes}
            loading={loading}
            setError={setError}
            handleDeleteOrder={handleDeleteOrder}
          />
        )}
      </main>
    </div>
  );
};

export default App;

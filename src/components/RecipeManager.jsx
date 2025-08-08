import { LucidePlus, LucideEdit, LucideTrash2 } from 'lucide-react';
import React from 'react';
import './RecipeManager.css';

const RecipeManager = ({ recipes, ingredients, form, setForm, editingId, setEditingId, loading, setError, fetchRecipes, getIngredientName, API_BASE_URL, searchQuery, setSearchQuery }) => {
  const handleRecipeInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleRecipeIngredientChange = (index, e) => {
    const { name, value } = e.target;
    const newIngredients = [...form.ingredients];
    newIngredients[index][name] = value;
    setForm({ ...form, ingredients: newIngredients });
  };
  
  const handleAddRecipeIngredient = () => {
    setForm({
      ...form,
      ingredients: [...form.ingredients, { ingredientId: '', quantity: '' }],
    });
  };

  const handleRemoveRecipeIngredient = (index) => {
    const newIngredients = form.ingredients.filter((_, i) => i !== index);
    setForm({ ...form, ingredients: newIngredients });
  };

  const handleAddOrUpdateRecipe = async (e) => {
    e.preventDefault();
    setError(null);
    const url = editingId ? `${API_BASE_URL}/recipes/${editingId}` : `${API_BASE_URL}/recipes`;
    const method = editingId ? 'PUT' : 'POST';
    
    const payload = {
      name: form.name,
      pizza_id: form.pizza_id,
      pizza_size: form.pizza_size,
      pizza_category: form.pizza_category,
      ingredients: form.ingredients.map(ing => ({
        ...ing,
        quantity: Number(ing.quantity),
      })),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save recipe');
      setForm({ name: '', pizza_id: '', pizza_size: '', pizza_category: '', ingredients: [{ ingredientId: '', quantity: '' }] });
      setEditingId(null);
      fetchRecipes();
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleDeleteRecipe = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete recipe');
      fetchRecipes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditRecipeClick = (recipe) => {
    setEditingId(recipe.id);
    setForm({ name: recipe.name, pizza_id: recipe.pizza_id, pizza_size: recipe.pizza_size, pizza_category: recipe.pizza_category, ingredients: recipe.ingredients });
  };

  const getIngredientUnit = (id) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    return ingredient ? ingredient.unit : '';
  };
  
  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="card">
      <h2 className="card-title">Recipe Management</h2>
      <form onSubmit={handleAddOrUpdateRecipe} className="recipe-form-grid">
        <div className="input-group">
          <label className="label">Recipe Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleRecipeInputChange}
            placeholder="e.g., The Hawaiian Pizza"
            required
            className="form-input"
          />
        </div>
        <div className="input-group">
          <label className="label">Pizza ID</label>
          <input
            type="text"
            name="pizza_id"
            value={form.pizza_id}
            onChange={handleRecipeInputChange}
            placeholder="e.g., hawaiian_m"
            required
            className="form-input"
          />
        </div>
        <div className="input-group">
          <label className="label">Pizza Size</label>
          <select
            name="pizza_size"
            value={form.pizza_size}
            onChange={handleRecipeInputChange}
            className="form-select"
            required
          >
            <option value="">Select size</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
            <option value="XL">Extra Large</option>
            <option value="XXL">Extra Extra Large</option>
          </select>
        </div>
        <div className="input-group">
          <label className="label">Pizza Category</label>
          <select
            name="pizza_category"
            value={form.pizza_category}
            onChange={handleRecipeInputChange}
            className="form-select"
            required
          >
            <option value="">Select category</option>
            <option value="Chicken">Chicken</option>
            <option value="Classic">Classic</option>
            <option value="Supreme">Supreme</option>
            <option value="Veggie">Veggie</option>
          </select>
        </div>
        
        <div className="form-space-y-2">
          <label className="label">Ingredients</label>
          {form.ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-row">
              <select
                name="ingredientId"
                value={ingredient.ingredientId}
                onChange={(e) => handleRecipeIngredientChange(index, e)}
                required
                className="form-select"
              >
                <option value="">Select an ingredient</option>
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>{ing.name}</option>
                ))}
              </select>
              <div className="quantity-input-group">
                <input
                  type="number"
                  name="quantity"
                  value={ingredient.quantity}
                  onChange={(e) => handleRecipeIngredientChange(index, e)}
                  placeholder="Quantity"
                  required
                  className="form-input"
                />
                <span className="unit-label">{getIngredientUnit(ingredient.ingredientId)}</span>
              </div>
              <div className="button-group">
                <button
                  type="button"
                  onClick={() => handleRemoveRecipeIngredient(index)}
                  className="icon-button red"
                >
                  <LucideTrash2 size={18} />
                </button>
                {index === form.ingredients.length - 1 && (
                  <button
                    type="button"
                    onClick={handleAddRecipeIngredient}
                    className="icon-button green"
                  >
                    <LucidePlus size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="form-button blue w-full"
        >
          {loading && <div className="spinner"></div>}
          {!loading && (editingId ? 'Update Recipe' : <><LucidePlus size={18} /><span>Add Recipe</span></>)}
        </button>
      </form>

      <h3 className="card-title mt-8 mb-4">Current Recipes</h3>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      {loading && filteredRecipes.length === 0 ? (
        <div className="text-center p-8">
          <div className="spinner"></div>
          <span className="ml-4 text-gray-500">Loading recipes...</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Recipe Name</th>
                <th>Pizza ID</th>
                <th>Category</th>
                <th>Size</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecipes.map((recipe) => (
                <tr key={recipe.id}>
                  <td>{recipe.name}</td>
                  <td>{recipe.pizza_id}</td>
                  <td>{recipe.pizza_category}</td>
                  <td>{recipe.pizza_size}</td>
                  <td className="text-right space-x-2">
                    <button onClick={() => handleEditRecipeClick(recipe)} className="icon-button"><LucideEdit size={18} /></button>
                    <button onClick={() => handleDeleteRecipe(recipe.id)} className="icon-button red"><LucideTrash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {recipes.length === 0 && !loading && !error && (
        <p className="text-center mt-4">No recipes found. Add a new one above!</p>
      )}
    </div>
  );
};

export default RecipeManager;

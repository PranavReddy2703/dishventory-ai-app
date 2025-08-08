import { LucidePlus, LucideEdit, LucideTrash2 } from 'lucide-react';
import React from 'react';
import './InventoryManager.css';

const InventoryManager = ({ ingredients, form, setForm, editingId, setEditingId, loading, setError, fetchIngredients, fetchRecipes, API_BASE_URL, searchQuery, setSearchQuery }) => {
  const handleIngredientInputChange = (e) => {
    const { name, value } = e.target;
    // Special handling for quantity to ensure it's a number
    setForm({ ...form, [name]: name === 'quantity' ? Number(value) : value });
  };

  const formatQuantity = (quantity, unit) => {
    if (unit === 'g' || unit === 'ml') {
      if (quantity >= 1000) {
        const converted = quantity / 1000;
        return `${converted} ${unit === 'g' ? 'kg' : 'L'}`;
      } else {
        return `${quantity} ${unit}`;
      }
    }
    return `${quantity} ${unit}`;
  };

  const handleAddOrUpdateIngredient = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      quantity: Number(form.quantity),
      unit: form.unit,
    };
    const url = editingId ? `${API_BASE_URL}/ingredients/${editingId}` : `${API_BASE_URL}/ingredients`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save ingredient');
      setForm({ name: '', quantity: '', unit: 'g' });
      setEditingId(null);
      fetchIngredients();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ingredient?")) return;
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete ingredient');
      fetchIngredients();
      fetchRecipes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditIngredientClick = (ingredient) => {
    setEditingId(ingredient.id);
    setForm({ name: ingredient.name, quantity: ingredient.quantity, unit: ingredient.unit });
  };
  
  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="inventory-card">
      <h2 className="inventory-title">Inventory Management</h2>
      <form onSubmit={handleAddOrUpdateIngredient} className="inventory-form-grid">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleIngredientInputChange}
          placeholder="Ingredient Name"
          required
          className="form-input md-col-span-1"
        />
        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleIngredientInputChange}
          placeholder="Quantity"
          required
          className="form-input md-col-span-1"
        />
        <select
          name="unit"
          value={form.unit}
          onChange={handleIngredientInputChange}
          className="form-select md-col-span-1"
        >
          <option value="g">Grams (g)</option>
          <option value="ml">Milliliters (ml)</option>
          <option value="slices">Slices</option>
          <option value="units">Units</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="form-button form-button-blue md-col-span-1"
        >
          {loading && <div className="spinner"></div>}
          {!loading && (editingId ? 'Update Ingredient' : <><LucidePlus size={18} /><span>Add Ingredient</span></>)}
        </button>
      </form>
      
      <h3 className="inventory-title mt-8 mb-4">Current Stock</h3>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      {loading && ingredients.length === 0 ? (
        <div className="text-center p-8">
          <div className="spinner"></div>
          <span className="ml-4 text-gray-500">Loading ingredients...</span>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIngredients.map((ingredient) => (
                <tr key={ingredient.id}>
                  <td>{ingredient.name}</td>
                  <td>{formatQuantity(ingredient.quantity, ingredient.unit)}</td>
                  <td>{ingredient.unit}</td>
                  <td className="text-right space-x-2">
                    <button onClick={() => handleEditIngredientClick(ingredient)} className="text-indigo-600"><LucideEdit size={18} /></button>
                    <button onClick={() => handleDeleteIngredient(ingredient.id)} className="text-red-600"><LucideTrash2 size={18} /></button>
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

export default InventoryManager;

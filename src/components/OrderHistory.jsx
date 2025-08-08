import React from 'react';
import { LucideTrash2 } from 'lucide-react';
import './OrderHistory.css';

const OrderHistory = ({ orders, recipes, loading, setError, handleDeleteOrder }) => {
  const handleDownloadCSV = () => {
    if (orders.length === 0) {
      alert("No orders to download.");
      return;
    }

    const headers = [
      "Order ID",
      "Pizza ID",
      "Quantity",
      "Order Date",
      "Order Time",
      "Pizza Size",
      "Pizza Category",
      "Pizza Name"
    ];

    let csvContent = headers.join(',') + '\n';

    orders.forEach(order => {
      order.items.forEach(item => {
        const recipe = recipes.find(r => r.id === item.recipeId);
        if (recipe) {
          const orderDate = new Date(order.timestamp._seconds * 1000).toLocaleDateString();
          const orderTime = new Date(order.timestamp._seconds * 1000).toLocaleTimeString();
          
          const row = [
            order.id,
            recipe.pizza_id,
            item.quantity,
            orderDate,
            orderTime,
            recipe.pizza_size,
            recipe.pizza_category,
            recipe.name
          ];
          csvContent += row.join(',') + '\n';
        }
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "order_history.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="card">
      <div className="order-header">
        <h2 className="card-title">Order History</h2>
        <button
          onClick={handleDownloadCSV}
          className="download-csv-button"
          disabled={orders.length === 0}
        >
          Download CSV
        </button>
      </div>
      {loading && orders.length === 0 ? (
          <div className="text-center p-8">
              <div className="spinner"></div>
              <span className="ml-4 text-gray-500">Loading orders...</span>
          </div>
      ) : (
        <div className="order-history-list">
          {orders.length > 0 ? orders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-header">
                <p className="order-id">Order ID: <span className="order-id-value">{order.id}</span></p>
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  className="delete-button"
                  disabled={loading}
                >
                  <LucideTrash2 size={18} />
                </button>
              </div>
              <p className="order-timestamp">
                Timestamp: {order.timestamp ? new Date(order.timestamp._seconds * 1000).toLocaleString() : 'N/A'}
              </p>
              <ul className="order-items-list">
                {order.items.map((item, index) => {
                  const recipe = recipes.find(r => r.id === item.recipeId);
                  return (
                    <li key={index} className="order-item-detail">
                      {recipe ? recipe.name : 'Unknown Pizza'} x {item.quantity}
                    </li>
                  );
                })}
              </ul>
            </div>
          )) : (
            <p className="text-center mt-4">No orders placed yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;

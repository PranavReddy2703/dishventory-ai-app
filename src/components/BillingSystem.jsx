import { LucidePlus, LucideShoppingCart, LucideX, LucideMinus, LucidePrinter } from 'lucide-react';
import React from 'react';
import './BillingSystem.css';

const BillingSystem = ({ recipes, cart, setCart, loading, setError, fetchIngredients, fetchOrders, handleAddToCart, handleUpdateCartItem, handleRemoveFromCart, handlePlaceOrder, searchQuery, setSearchQuery, API_BASE_URL, paymentMethod, setPaymentMethod }) => {
  const handlePrintBill = () => {
    // This function creates a simple, printable bill in a new window
    if (cart.length === 0) {
      alert("Cart is empty. Nothing to print.");
      return;
    }

    const billItems = cart.map(item => {
      // Assuming a flat price for now, you can adjust this logic later
      const itemPrice = 10;
      return {
        name: item.name,
        quantity: item.quantity,
        price: itemPrice,
        total: itemPrice * item.quantity
      };
    });

    const subtotal = billItems.reduce((acc, item) => acc + item.total, 0);
    const taxRate = 0.08; // Example 8% tax
    const taxAmount = subtotal * taxRate;
    const finalTotal = subtotal + taxAmount;

    const billContent = `
      <html>
        <head>
          <title>Bill</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 2rem; }
            h1 { text-align: center; margin-bottom: 2rem; }
            .bill-item { display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding: 0.5rem 0; }
            .bill-total { font-weight: bold; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <h1>Pizza Bill</h1>
          ${billItems.map(item => `
            <div class="bill-item">
              <span>${item.name} x ${item.quantity}</span>
              <span>$${item.total.toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="bill-item">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="bill-item">
            <span>Tax (${(taxRate * 100).toFixed(0)}%):</span>
            <span>$${taxAmount.toFixed(2)}</span>
          </div>
          <div class="bill-item bill-total">
            <span>Total:</span>
            <span>$${finalTotal.toFixed(2)}</span>
          </div>
          <p style="text-align: center; margin-top: 2rem;">Payment Method: ${paymentMethod}</p>
        </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(billContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } else {
      alert("Please allow pop-ups to print the bill.");
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Billing (Point of Sale)</h2>
      <div className="billing-grid">
        <div>
          <h3 className="card-title mb-4">Available Pizzas</h3>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search pizzas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="available-pizzas-list">
            {recipes.length > 0 ? recipes.map(recipe => (
              <div key={recipe.id} className="pizza-item">
                <span className="pizza-name">{recipe.name}</span>
                <button
                  onClick={() => handleAddToCart(recipe)}
                  className="add-to-cart-button"
                >
                  <LucidePlus size={18} />
                </button>
              </div>
            )) : (
              <p className="text-center mt-4 text-gray-500">No recipes available. Please add some in the Recipe Management section.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="card-title mb-4">Current Order</h3>
          <div className="available-pizzas-list">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <span className="cart-item-name">{item.name}</span>
                  <div className="cart-controls">
                    <button
                      onClick={() => handleUpdateCartItem(item.id, item.quantity - 1)}
                      className="quantity-button"
                    >
                      <LucideMinus size={18} />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleUpdateCartItem(item.id, Number(e.target.value))}
                      className="quantity-input"
                    />
                    <button
                      onClick={() => handleUpdateCartItem(item.id, item.quantity + 1)}
                      className="quantity-button"
                    >
                      <LucidePlus size={18} />
                    </button>
                  </div>
                  <button onClick={() => handleRemoveFromCart(item.id)} className="remove-from-cart-button">
                    <LucideX size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">Cart is empty.</p>
            )}
          </div>
          <div className="payment-options">
            <label htmlFor="payment-method" className="payment-label">Payment Method:</label>
            <select
              id="payment-method"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="payment-select"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
          </div>
          <button
            onClick={handlePlaceOrder}
            disabled={cart.length === 0 || loading}
            className="place-order-button"
          >
            {loading && <div className="spinner"></div>}
            {!loading && <><LucideShoppingCart size={18} /><span>Place Order</span></>}
          </button>
          <button
            onClick={handlePrintBill}
            disabled={cart.length === 0}
            className="print-button"
          >
            <LucidePrinter size={18} /><span>Print Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingSystem;

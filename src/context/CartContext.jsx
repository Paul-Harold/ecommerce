import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // 1. Initialize from localStorage so cart survives page reloads
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('midnight_cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error('Error parsing cart data', error);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activePromo, setActivePromo] = useState(null); 

  // 2. Automatically sync to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('midnight_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
    setIsCartOpen(true); 
  };

  // 3. NEW: Allows the CartMenu + / - buttons to adjust exact amounts
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return; // Prevents negative stock
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setActivePromo(null); 
  };

  const applyDiscount = (promoObject) => {
    setActivePromo(promoObject);
  };

  const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems,
      cart: cartItems, // Alias added to ensure Checkout.jsx compatibility
      addToCart, 
      updateQuantity,  // Exported the new function
      removeFromCart, 
      clearCart, 
      isCartOpen, 
      setIsCartOpen,
      cartCount,
      activePromo,    
      applyDiscount  
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext); 
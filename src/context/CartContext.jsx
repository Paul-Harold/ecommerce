import { createContext, useState, useContext } from 'react';

// 1. Create the Context
const CartContext = createContext();

// 2. Create the Provider (The Engine)
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); // Controls the slide-out menu

  // Function to add items to the cart
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // Check if the item is already in the cart
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // If it is, just increase the quantity
        return prevItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      // If it's new, add it to the array
      return [...prevItems, { ...product, quantity }];
    });
    
    // Automatically slide open the cart menu when they add something
    setIsCartOpen(true); 
  };

  // Function to remove items
  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculate the total number of items for the Navbar dot
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      isCartOpen, 
      setIsCartOpen,
      cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
}

// 3. Create a custom hook so our pages can easily talk to the engine
export const useCart = () => useContext(CartContext);
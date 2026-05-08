import React, { createContext, useState, useContext } from 'react';

export const CartContext = createContext({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  totalAmount: 0,
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (fish) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === fish.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === fish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...fish, quantity: 1 }];
    });
  };

  const removeFromCart = (fishId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === fishId);
      if (existingItem?.quantity === 1) {
        return prevCart.filter(item => item.id !== fishId);
      }
      return prevCart.map(item =>
        item.id === fishId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

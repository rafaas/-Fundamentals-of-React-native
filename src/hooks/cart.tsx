import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProdutos = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storagedProdutos) {
        setProducts([...JSON.parse(storagedProdutos)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productsExists = products.find(
        productIteration => productIteration.id === product.id,
      );

      const productsData = productsExists
        ? products.map(productIteration =>
            productIteration.id === product.id
              ? { ...productIteration, quantity: productIteration.quantity + 1 }
              : productIteration,
          )
        : [...products, { ...product, quantity: 1 }];

      setProducts(productsData);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(productsData),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productsList = products.map(productIteration =>
        productIteration.id === id
          ? { ...productIteration, quantity: productIteration.quantity + 1 }
          : productIteration,
      );

      setProducts(productsList);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(productsList),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productsList = products.map(productIteration =>
        productIteration.id === id && productIteration.quantity > 1
          ? { ...productIteration, quantity: productIteration.quantity - 1 }
          : productIteration,
      );

      setProducts(productsList);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(productsList),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

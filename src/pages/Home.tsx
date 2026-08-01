import { useState, useEffect } from "react";
import api from "../services/api";
import type { IProduct } from "../types/product";
import ProductCard from "../components/ProductCard";
import Hero from "../components/Hero";

const Home = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        console.log(response.data.data.docs);
        setProducts(response.data.data.docs);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <Hero />
      <main
        id="products-section"
        className="flex-grow max-w-7xl w-full mx-auto p-6"
      >
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">
            Explore products
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Best products available with the best prices!
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-blue-600 font-semibold animate-pulse text-lg">
              Loading Products ...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;

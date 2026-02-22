import { useState, useEffect } from 'react';
import HeartIcon from '../components/HeartIcon.jsx';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../libs/supabase.js';

export default function Shops() {
  const navigate = useNavigate(); 
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState([]);
  
  // NEW: State to track the sorting dropdown
  const [sortBy, setSortBy] = useState('Featured');

  // 2. Fetch data from Supabase when the page loads
  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
          
        if (error) throw error;
        
        if (data) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Error fetching products:", error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Function to add/remove a product from favorites
  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId));
    } else {
      setFavorites([...favorites, productId]);
    }
  };

  const categories = ['All', 'Mouse', 'Keyboard', 'Headset', 'Microphones'];

  // This filters the dynamically loaded product array by category
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(item => item.category === activeCategory);

  // NEW: This sorts those filtered products based on what is selected in the dropdown
  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Newest Arrivals') return new Date(b.created_at) - new Date(a.created_at);
    return 0; // Default for 'Featured'
  });

  return (
    <div className="min-h-screen bg-midnight text-white pt-10 pb-24 px-6">
      <div className="max-w-[1400px] mx-auto">
        
        {/* PAGE HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-4">
            Midnight <span className="text-electric">Arsenal</span>
          </h1>
          <p className="text-gray-400 text-lg">Equip yourself with precision-engineered hardware.</p>
        </div>

        {/* CONTROLS (Filters & Sorting) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6 mb-12 gap-6">
          <div className="flex flex-wrap gap-3 md:gap-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
                  activeCategory === cat 
                    ? 'bg-electric text-midnight border-electric shadow-[0_0_15px_rgba(64,224,255,0.4)]' 
                    : 'bg-transparent text-gray-400 border-gray-700 hover:border-electric hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm uppercase tracking-widest font-bold">Sort By:</span>
            {/* NEW: Connected the dropdown to our state */}
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#0f1115] border border-gray-700 text-white text-sm rounded px-4 py-2 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric cursor-pointer"
            >
              <option>Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>
        </div>

        {/* PRODUCT GRID OR LOADING SPINNER */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
             <div className="w-12 h-12 border-4 border-gray-800 border-t-electric rounded-full animate-spin mb-4"></div>
             <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">Loading Arsenal...</p>
          </div>
        ) : sortedAndFilteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* NEW: We now map over the sorted array instead of just the filtered one */}
            {/* NEW: We now map over the sorted array instead of just the filtered one */}
            {sortedAndFilteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => navigate(`/product/${product.id}`)}
                className="group bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden hover:border-electric transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(64,224,255,0.15)] cursor-pointer shadow-lg"
              >
                {/* Product Image Box */}
                <div className="relative h-72 bg-gray-900 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${product.image})` }}
                  ></div>
                  
                  {/* Favorite Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); 
                      toggleFavorite(product.id);
                    }}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:text-electric transition-all duration-300 focus:outline-none"
                  >
                    <HeartIcon 
                      isFilled={favorites.includes(product.id)} 
                      className={`w-5 h-5 transition-colors ${favorites.includes(product.id) ? "text-electric" : ""}`} 
                    />
                  </button>
                  
                  {/* Quick Add Button */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                    <button className="bg-electric text-midnight font-bold py-3 px-8 rounded hover:bg-white transition-all duration-300 uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 pointer-events-auto">
                      Add to Cart
                    </button>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-6">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{product.category}</p>
                  <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-electric font-bold text-lg">${product.price}</p>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-gray-800 rounded-xl">
            <p className="text-gray-500 text-xl font-bold uppercase tracking-widest">No gear found in this category.</p>
          </div>
        )}

      </div>
    </div>
  );
}
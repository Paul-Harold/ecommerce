import { useState } from 'react';
import HeartIcon from '../components/HeartIcon.jsx';

// FAKE DATABASE: We will swap this out later when you connect your actual backend.
const products = [
    { id: 1, name: "Phantom Wireless", category: "Mouse", price: 129.99, image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600" },
    { id: 2, name: "Apex Pro TKL", category: "Keyboard", price: 189.99, image: "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600" },
    { id: 3, name: "Echo Studio", category: "Microphones", price: 149.99, image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600" },
    { id: 4, name: "Nova Pro Wireless", category: "Headset", price: 249.99, image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600" },
    { id: 5, name: "Viper Mini", category: "Mouse", price: 49.99, image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?q=80&w=600" },
    { id: 6, name: "G Pro X Superlight", category: "Mouse", price: 149.99, image: "https://images.unsplash.com/photo-1605773527852-c546a8584ea3?q=80&w=600" },
];

export default function Shops() {
  // State to track which category is currently selected
    const [activeCategory, setActiveCategory] = useState('All');
    
  // State to track an array of favorited product IDs
    const [favorites, setFavorites] = useState([]);

  // Function to add/remove a product from favorites
    const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter(id => id !== productId)); // Remove it
    } else {
      setFavorites([...favorites, productId]); // Add it
    }
    };

  // Your requested categories
    const categories = ['All', 'Mouse', 'Keyboard', 'Headset', 'Microphones'];

  // This filters the product array based on the active button
    const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(item => item.category === activeCategory);

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

          {/* Category Filter Buttons */}
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

          {/* Sort Dropdown (Visual layout placeholder) */}
            <div className="flex items-center gap-3">
            <span className="text-gray-500 text-sm uppercase tracking-widest font-bold">Sort By:</span>
            <select className="bg-[#0f1115] border border-gray-700 text-white text-sm rounded px-4 py-2 focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric cursor-pointer">
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
            </select>
            </div>
        </div>

        {/* PRODUCT GRID */}
        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
                <div key={product.id} className="group bg-[#0f1115] border border-gray-800 rounded-xl overflow-hidden hover:border-electric transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(64,224,255,0.15)] cursor-pointer shadow-lg">
                {/* Product Image Box with Hover Effect */}
                <div className="relative h-72 bg-gray-900 overflow-hidden">
                    <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${product.image})` }}
                    ></div>
                    
                 {/* Favorite Button (Top Right) */}
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
                    
                  {/* Quick Add Button (Reveals on Hover) */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
                    {/* Changed transition-colors to transition-all so the sliding motion is buttery smooth on exit */}
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
          /* Empty State if a category has no products */
            <div className="text-center py-24 border border-dashed border-gray-800 rounded-xl">
            <p className="text-gray-500 text-xl font-bold uppercase tracking-widest">No gear found in this category.</p>
            </div>
        )}

        </div>
    </div>
    );
}